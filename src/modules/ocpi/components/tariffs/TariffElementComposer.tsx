import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Clock, Calendar, DollarSign, ArrowDownUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PriceComponentEditor } from './PriceComponentEditor';
import { TimeRestrictionEditor } from './TimeRestrictionEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Define types based on the API response structure
export interface PriceComponent {
  type: 'ENERGY' | 'TIME' | 'FLAT' | 'PARKING_TIME';
  price: number;
  step_size: number;
  unit?: string;
}

export interface TimeRestriction {
  start_time: string;
  end_time: string;
  day_of_week?: string[];
}

export interface Restrictions {
  time_restrictions?: TimeRestriction[];
  // Other restriction types could be added here as needed
}

export interface TariffElement {
  price_components: PriceComponent[];
  restrictions?: Restrictions;
}

interface TariffElementComposerProps {
  elements: TariffElement[];
  onChange: (elements: TariffElement[]) => void;
}

export const TariffElementComposer: React.FC<TariffElementComposerProps> = ({
  elements,
  onChange
}) => {
  const [activeElementIndex, setActiveElementIndex] = useState<number | null>(
    elements.length > 0 ? 0 : null
  );
  
  // Add a new empty tariff element
  const handleAddElement = () => {
    const newElement: TariffElement = {
      price_components: [{
        type: 'ENERGY',
        price: 0,
        step_size: 1
      }]
    };
    
    const updatedElements = [...elements, newElement];
    onChange(updatedElements);
    setActiveElementIndex(updatedElements.length - 1);
  };
  
  // Remove a tariff element at the specified index
  const handleRemoveElement = (index: number) => {
    const updatedElements = [...elements];
    updatedElements.splice(index, 1);
    onChange(updatedElements);
    
    // Update active index if needed
    if (activeElementIndex === index) {
      setActiveElementIndex(updatedElements.length > 0 ? 0 : null);
    } else if (activeElementIndex !== null && activeElementIndex > index) {
      setActiveElementIndex(activeElementIndex - 1);
    }
  };
  
  // Update price components for a specific element
  const handleUpdatePriceComponents = (componentIndex: number, priceComponents: PriceComponent[]) => {
    if (activeElementIndex === null) return;
    
    const updatedElements = [...elements];
    updatedElements[activeElementIndex] = {
      ...updatedElements[activeElementIndex],
      price_components: priceComponents
    };
    
    onChange(updatedElements);
  };
  
  // Update time restrictions for a specific element
  const handleUpdateTimeRestrictions = (timeRestrictions: TimeRestriction[]) => {
    if (activeElementIndex === null) return;
    
    const updatedElements = [...elements];
    updatedElements[activeElementIndex] = {
      ...updatedElements[activeElementIndex],
      restrictions: {
        ...updatedElements[activeElementIndex].restrictions,
        time_restrictions: timeRestrictions
      }
    };
    
    onChange(updatedElements);
  };
  
  // Toggle time restrictions for an element
  const handleToggleTimeRestrictions = (hasTimeRestrictions: boolean) => {
    if (activeElementIndex === null) return;
    
    const updatedElements = [...elements];
    
    if (hasTimeRestrictions) {
      // Add default time restriction if enabling
      updatedElements[activeElementIndex] = {
        ...updatedElements[activeElementIndex],
        restrictions: {
          ...updatedElements[activeElementIndex].restrictions,
          time_restrictions: [
            {
              start_time: '08:00',
              end_time: '20:00',
              day_of_week: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
            }
          ]
        }
      };
    } else {
      // Remove time restrictions if disabling
      const { restrictions, ...rest } = updatedElements[activeElementIndex];
      const newRestrictions = {...restrictions};
      
      if (newRestrictions.time_restrictions) {
        delete newRestrictions.time_restrictions;
      }
      
      updatedElements[activeElementIndex] = {
        ...rest,
        restrictions: Object.keys(newRestrictions).length > 0 ? newRestrictions : undefined
      };
    }
    
    onChange(updatedElements);
  };
  
  // Determine if the active element has time restrictions
  const hasTimeRestrictions = activeElementIndex !== null 
    && elements[activeElementIndex].restrictions?.time_restrictions?.length > 0;
  
  // Get current price components and time restrictions
  const currentPriceComponents = activeElementIndex !== null
    ? elements[activeElementIndex].price_components || []
    : [];
    
  const currentTimeRestrictions = activeElementIndex !== null
    ? elements[activeElementIndex].restrictions?.time_restrictions || []
    : [];
  
  // Render element labels/badges for the element list
  const renderElementLabel = (element: TariffElement, index: number) => {
    const hasRestrictions = element.restrictions?.time_restrictions?.length > 0;
    const componentCount = element.price_components.length;
    
    return (
      <div className="flex items-center space-x-2">
        <span>Element {index + 1}</span>
        <div className="flex space-x-1">
          <Badge variant="outline" className="text-xs">
            <DollarSign className="h-3 w-3 mr-1" />
            {componentCount} component{componentCount !== 1 ? 's' : ''}
          </Badge>
          
          {hasRestrictions && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Time restricted
            </Badge>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Tariff Elements</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleAddElement}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Element
        </Button>
      </div>
      
      {elements.length === 0 ? (
        <Alert>
          <AlertTitle>No tariff elements defined</AlertTitle>
          <AlertDescription>
            Add at least one tariff element to define the price structure. Each element can have its own price components and time restrictions.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Element Selector - Left Panel */}
          <div className="col-span-1 border rounded-md overflow-hidden">
            <div className="bg-muted p-2 font-medium">Elements</div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-1 p-2">
                {elements.map((element, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-2 rounded-md ${
                      activeElementIndex === index 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted cursor-pointer'
                    }`}
                    onClick={() => setActiveElementIndex(index)}
                  >
                    <div className="truncate mr-2">
                      {renderElementLabel(element, index)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 ${
                        activeElementIndex === index 
                          ? 'hover:bg-primary-foreground/20 text-primary-foreground' 
                          : 'hover:bg-destructive/10 text-destructive'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveElement(index);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Element Editor - Right Panel */}
          <div className="col-span-1 md:col-span-4">
            {activeElementIndex !== null ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Element {activeElementIndex + 1} Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="price">
                    <TabsList className="mb-4">
                      <TabsTrigger value="price">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Price Components
                      </TabsTrigger>
                      <TabsTrigger value="time">
                        <Clock className="h-4 w-4 mr-2" />
                        Time Restrictions
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="price" className="space-y-4">
                      <PriceComponentEditor
                        components={currentPriceComponents}
                        onChange={(components) => handleUpdatePriceComponents(activeElementIndex, components)}
                      />
                    </TabsContent>
                    
                    <TabsContent value="time">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={hasTimeRestrictions ? "destructive" : "outline"}
                            onClick={() => handleToggleTimeRestrictions(!hasTimeRestrictions)}
                          >
                            {hasTimeRestrictions ? (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Time Restrictions
                              </>
                            ) : (
                              <>
                                <Clock className="h-4 w-4 mr-2" />
                                Add Time Restrictions
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {hasTimeRestrictions && (
                          <TimeRestrictionEditor
                            restrictions={currentTimeRestrictions}
                            onChange={handleUpdateTimeRestrictions}
                          />
                        )}
                        
                        {!hasTimeRestrictions && (
                          <div className="p-4 bg-muted rounded-md text-center text-muted-foreground">
                            <p>No time restrictions applied.</p>
                            <p className="text-sm">This element applies at all times.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center border rounded-md p-8">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">No element selected or available</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddElement}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Element
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TariffElementComposer;
