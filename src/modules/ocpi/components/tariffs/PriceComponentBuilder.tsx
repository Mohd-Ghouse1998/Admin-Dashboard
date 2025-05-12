import React, { useState } from 'react';
import { PlusCircle, Trash2, Clock, Calendar, DollarSign } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export interface PriceComponent {
  type: 'TIME' | 'ENERGY' | 'FLAT' | 'PARKING_TIME';
  price: number;
  vat?: number;
  step_size?: number;
  time_restriction?: {
    start_time: string;
    end_time: string;
    day_of_week?: string[];
  };
}

interface PriceComponentBuilderProps {
  components: PriceComponent[];
  onChange: (components: PriceComponent[]) => void;
}

const PriceComponentBuilder: React.FC<PriceComponentBuilderProps> = ({
  components,
  onChange
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newComponent, setNewComponent] = useState<PriceComponent>({
    type: 'ENERGY',
    price: 0,
    step_size: 1
  });
  const [showTimeRestriction, setShowTimeRestriction] = useState(false);

  const handleAddComponent = () => {
    const updatedComponents = [...components, newComponent];
    onChange(updatedComponents);
    setNewComponent({
      type: 'ENERGY',
      price: 0,
      step_size: 1
    });
    setShowAddForm(false);
    setShowTimeRestriction(false);
  };

  const handleRemoveComponent = (index: number) => {
    const updatedComponents = [...components];
    updatedComponents.splice(index, 1);
    onChange(updatedComponents);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TIME':
        return <Clock className="h-4 w-4" />;
      case 'ENERGY':
        return <DollarSign className="h-4 w-4" />;
      case 'FLAT':
        return <DollarSign className="h-4 w-4" />;
      case 'PARKING_TIME':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'TIME':
        return 'Time Based';
      case 'ENERGY':
        return 'Energy Based';
      case 'FLAT':
        return 'Flat Fee';
      case 'PARKING_TIME':
        return 'Parking Time';
      default:
        return type;
    }
  };

  const getDaysOfWeek = (days?: string[]) => {
    if (!days || days.length === 0) return 'All days';
    return days.join(', ');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Price Components</h3>
        {!showAddForm && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddForm(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Component
          </Button>
        )}
      </div>

      {/* List of existing components */}
      {components.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">No price components defined</p>
          <p className="text-sm text-muted-foreground">Add components to define your tariff pricing structure</p>
        </div>
      ) : (
        <div className="space-y-3">
          {components.map((component, index) => (
            <Card key={index} className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleRemoveComponent(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit">
                  {getTypeIcon(component.type)}
                  <span className="ml-1">{getTypeLabel(component.type)}</span>
                </Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 pb-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Price</Label>
                  <p className="font-medium">{component.price} EUR</p>
                </div>
                {component.step_size && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Step Size</Label>
                    <p className="font-medium">
                      {component.step_size} {component.type === 'TIME' || component.type === 'PARKING_TIME' ? 'seconds' : 'kWh'}
                    </p>
                  </div>
                )}
                {component.time_restriction && (
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Time Restriction</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{getDaysOfWeek(component.time_restriction.day_of_week)}</span>
                      <Clock className="h-3 w-3 text-muted-foreground ml-2" />
                      <span className="text-sm">
                        {component.time_restriction.start_time} - {component.time_restriction.end_time}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add new component form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Price Component</CardTitle>
            <CardDescription>Define a new price component for your tariff</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Component Type</Label>
                <Select
                  value={newComponent.type}
                  onValueChange={(value) => setNewComponent({...newComponent, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENERGY">Energy (kWh)</SelectItem>
                    <SelectItem value="TIME">Time (Duration)</SelectItem>
                    <SelectItem value="FLAT">Flat Fee</SelectItem>
                    <SelectItem value="PARKING_TIME">Parking Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (EUR)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newComponent.price || ''}
                  onChange={(e) => setNewComponent({...newComponent, price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              {newComponent.type !== 'FLAT' && (
                <div className="space-y-2">
                  <Label htmlFor="step-size">
                    Step Size ({newComponent.type === 'TIME' || newComponent.type === 'PARKING_TIME' ? 'seconds' : 'kWh'})
                  </Label>
                  <Input
                    id="step-size"
                    type="number"
                    step="0.1"
                    value={newComponent.step_size || ''}
                    onChange={(e) => setNewComponent({...newComponent, step_size: parseFloat(e.target.value) || 1 })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="vat">VAT (%)</Label>
                <Input
                  id="vat"
                  type="number"
                  step="0.1"
                  value={newComponent.vat || ''}
                  onChange={(e) => setNewComponent({...newComponent, vat: parseFloat(e.target.value) || undefined })}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center mb-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  type="button"
                  onClick={() => {
                    setShowTimeRestriction(!showTimeRestriction);
                    if (!showTimeRestriction && !newComponent.time_restriction) {
                      setNewComponent({
                        ...newComponent,
                        time_restriction: {
                          start_time: '08:00',
                          end_time: '20:00',
                        }
                      });
                    }
                  }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {showTimeRestriction ? 'Remove Time Restriction' : 'Add Time Restriction'}
                </Button>
              </div>

              {showTimeRestriction && (
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={newComponent.time_restriction?.start_time || '08:00'}
                      onChange={(e) => setNewComponent({
                        ...newComponent,
                        time_restriction: {
                          ...newComponent.time_restriction!,
                          start_time: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={newComponent.time_restriction?.end_time || '20:00'}
                      onChange={(e) => setNewComponent({
                        ...newComponent,
                        time_restriction: {
                          ...newComponent.time_restriction!,
                          end_time: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="mb-2 block">Days of Week</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                        const dayShort = day.substring(0, 3).toUpperCase();
                        const isSelected = newComponent.time_restriction?.day_of_week?.includes(dayShort) || false;
                        
                        return (
                          <Badge 
                            key={day}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const currentDays = newComponent.time_restriction?.day_of_week || [];
                              let newDays = [...currentDays];
                              
                              if (isSelected) {
                                newDays = newDays.filter(d => d !== dayShort);
                              } else {
                                newDays.push(dayShort);
                              }
                              
                              setNewComponent({
                                ...newComponent,
                                time_restriction: {
                                  ...newComponent.time_restriction!,
                                  day_of_week: newDays
                                }
                              });
                            }}
                          >
                            {day.substring(0, 3)}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => {
              setShowAddForm(false);
              setShowTimeRestriction(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddComponent}>
              Add Component
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default PriceComponentBuilder;
