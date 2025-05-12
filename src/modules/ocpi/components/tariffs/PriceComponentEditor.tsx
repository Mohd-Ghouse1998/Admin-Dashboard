import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, DollarSign, Clock, Zap, Bike, Car } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PriceComponent } from './TariffElementComposer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PriceComponentEditorProps {
  components: PriceComponent[];
  onChange: (components: PriceComponent[]) => void;
}

export const PriceComponentEditor: React.FC<PriceComponentEditorProps> = ({
  components,
  onChange
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newComponent, setNewComponent] = useState<PriceComponent>({
    type: 'ENERGY',
    price: 0,
    step_size: 1
  });
  
  // Add the new component to the list
  const handleAddComponent = () => {
    onChange([...components, newComponent]);
    setNewComponent({
      type: 'ENERGY',
      price: 0,
      step_size: 1
    });
    setShowAddForm(false);
  };
  
  // Remove a component at the specified index
  const handleRemoveComponent = (index: number) => {
    const updatedComponents = [...components];
    updatedComponents.splice(index, 1);
    onChange(updatedComponents);
  };
  
  // Update a component at the specified index
  const handleUpdateComponent = (index: number, field: keyof PriceComponent, value: any) => {
    const updatedComponents = [...components];
    updatedComponents[index] = {
      ...updatedComponents[index],
      [field]: value
    };
    onChange(updatedComponents);
  };
  
  // Get the icon for a component type
  const getTypeIcon = (type: PriceComponent['type']) => {
    switch (type) {
      case 'TIME':
        return <Clock className="h-4 w-4" />;
      case 'ENERGY':
        return <Zap className="h-4 w-4" />;
      case 'FLAT':
        return <DollarSign className="h-4 w-4" />;
      case 'PARKING_TIME':
        return <Car className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  // Get the friendly name for a component type
  const getTypeName = (type: PriceComponent['type']) => {
    switch (type) {
      case 'TIME':
        return 'Time-based';
      case 'ENERGY':
        return 'Energy-based';
      case 'FLAT':
        return 'Flat fee';
      case 'PARKING_TIME':
        return 'Parking time';
      default:
        return type;
    }
  };
  
  // Get the unit label for a component type
  const getUnitLabel = (type: PriceComponent['type']) => {
    switch (type) {
      case 'TIME':
        return 'minutes';
      case 'ENERGY':
        return 'kWh';
      case 'FLAT':
        return 'session';
      case 'PARKING_TIME':
        return 'hours';
      default:
        return 'unit';
    }
  };
  
  // Component type descriptions for tooltips
  const typeDescriptions = {
    ENERGY: 'Charge per kWh of energy consumed',
    TIME: 'Charge per minute of charging time',
    FLAT: 'Fixed fee per charging session',
    PARKING_TIME: 'Charge per hour for parking time (not charging)'
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Price Components</h4>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Component
        </Button>
      </div>
      
      {components.length === 0 && !showAddForm ? (
        <Alert>
          <AlertDescription>
            Add at least one price component to define how charges are calculated.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {/* Existing components */}
          {components.map((component, index) => (
            <Card key={index} className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => handleRemoveComponent(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <CardHeader className="py-3">
                <Badge variant="outline" className="w-fit">
                  {getTypeIcon(component.type)}
                  <span className="ml-1">{getTypeName(component.type)}</span>
                </Badge>
              </CardHeader>
              
              <CardContent className="py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`price-${index}`} className="text-xs text-muted-foreground">
                      Price
                    </Label>
                    <div className="flex items-center mt-1">
                      <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                      <Input
                        id={`price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={component.price}
                        onChange={(e) => handleUpdateComponent(index, 'price', parseFloat(e.target.value) || 0)}
                        className="max-w-[120px]"
                      />
                      <span className="ml-2 text-sm text-muted-foreground">
                        per {getUnitLabel(component.type)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`step-size-${index}`} className="text-xs text-muted-foreground">
                      Step Size
                    </Label>
                    <div className="flex items-center mt-1">
                      <Input
                        id={`step-size-${index}`}
                        type="number"
                        min="1"
                        value={component.step_size}
                        onChange={(e) => handleUpdateComponent(index, 'step_size', parseInt(e.target.value) || 1)}
                        className="max-w-[120px]"
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="text-xs">?</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm max-w-[200px]">
                              Step size defines the billing increment. For example, a step size of 5 for energy means billing in 5 kWh increments.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Add new component form */}
          {showAddForm && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">New Price Component</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="component-type">Type</Label>
                  <Select
                    value={newComponent.type}
                    onValueChange={(value: PriceComponent['type']) => 
                      setNewComponent({...newComponent, type: value})
                    }
                  >
                    <SelectTrigger id="component-type">
                      <SelectValue placeholder="Select component type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(['ENERGY', 'TIME', 'FLAT', 'PARKING_TIME'] as const).map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center">
                            {getTypeIcon(type)}
                            <span className="ml-2">{getTypeName(type)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground block mt-1">
                            {typeDescriptions[type]}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="component-price">Price</Label>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                      <Input
                        id="component-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newComponent.price}
                        onChange={(e) => 
                          setNewComponent({
                            ...newComponent, 
                            price: parseFloat(e.target.value) || 0
                          })
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Price per {getUnitLabel(newComponent.type)}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="component-step-size">Step Size</Label>
                    <Input
                      id="component-step-size"
                      type="number"
                      min="1"
                      value={newComponent.step_size}
                      onChange={(e) => 
                        setNewComponent({
                          ...newComponent, 
                          step_size: parseInt(e.target.value) || 1
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Billing increment
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end space-x-2 py-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleAddComponent}
                >
                  Add Component
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceComponentEditor;
