import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Clock } from 'lucide-react';
import { TimeRestriction } from './TariffElementComposer';

interface TimeRestrictionEditorProps {
  restrictions: TimeRestriction[];
  onChange: (restrictions: TimeRestriction[]) => void;
}

export const TimeRestrictionEditor: React.FC<TimeRestrictionEditorProps> = ({
  restrictions,
  onChange
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRestriction, setNewRestriction] = useState<TimeRestriction>({
    start_time: '08:00',
    end_time: '20:00',
    day_of_week: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  });
  
  // Add the new restriction to the list
  const handleAddRestriction = () => {
    onChange([...restrictions, newRestriction]);
    setNewRestriction({
      start_time: '08:00',
      end_time: '20:00',
      day_of_week: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    });
    setShowAddForm(false);
  };
  
  // Remove a restriction at the specified index
  const handleRemoveRestriction = (index: number) => {
    const updatedRestrictions = [...restrictions];
    updatedRestrictions.splice(index, 1);
    onChange(updatedRestrictions);
  };
  
  // Toggle a day selection in the new restriction form
  const toggleDay = (day: string) => {
    setNewRestriction(prev => {
      const currentDays = prev.day_of_week || [];
      let updatedDays;
      
      if (currentDays.includes(day)) {
        updatedDays = currentDays.filter(d => d !== day);
      } else {
        updatedDays = [...currentDays, day];
      }
      
      return {
        ...prev,
        day_of_week: updatedDays
      };
    });
  };
  
  // Toggle a day selection for an existing restriction
  const toggleExistingDay = (index: number, day: string) => {
    const updatedRestrictions = [...restrictions];
    const currentDays = updatedRestrictions[index].day_of_week || [];
    
    let updatedDays;
    if (currentDays.includes(day)) {
      updatedDays = currentDays.filter(d => d !== day);
    } else {
      updatedDays = [...currentDays, day];
    }
    
    updatedRestrictions[index] = {
      ...updatedRestrictions[index],
      day_of_week: updatedDays
    };
    
    onChange(updatedRestrictions);
  };
  
  // Update time for an existing restriction
  const updateRestrictionTime = (index: number, field: 'start_time' | 'end_time', value: string) => {
    const updatedRestrictions = [...restrictions];
    updatedRestrictions[index] = {
      ...updatedRestrictions[index],
      [field]: value
    };
    onChange(updatedRestrictions);
  };
  
  // Format time display
  const formatTimeDisplay = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    } catch (e) {
      return time;
    }
  };
  
  // Get day abbreviation
  const getDayAbbreviation = (day: string) => {
    switch (day) {
      case 'MONDAY': return 'Mon';
      case 'TUESDAY': return 'Tue';
      case 'WEDNESDAY': return 'Wed';
      case 'THURSDAY': return 'Thu';
      case 'FRIDAY': return 'Fri';
      case 'SATURDAY': return 'Sat';
      case 'SUNDAY': return 'Sun';
      default: return day.substring(0, 3);
    }
  };
  
  // All days of the week for selection
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  
  return (
    <div className="space-y-4">
      {restrictions.length === 0 && !showAddForm ? (
        <div className="bg-muted p-4 rounded-md text-center">
          <p className="text-muted-foreground mb-2">No time restrictions defined</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Time Restriction
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {/* Existing time restrictions */}
            {restrictions.map((restriction, index) => (
              <Card key={index}>
                <CardHeader className="py-3 flex flex-row items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <CardTitle className="text-base">
                      {formatTimeDisplay(restriction.start_time)} - {formatTimeDisplay(restriction.end_time)}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveRestriction(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                
                <CardContent className="py-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`start-time-${index}`}>Start Time</Label>
                      <Input
                        id={`start-time-${index}`}
                        type="time"
                        value={restriction.start_time}
                        onChange={(e) => updateRestrictionTime(index, 'start_time', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`end-time-${index}`}>End Time</Label>
                      <Input
                        id={`end-time-${index}`}
                        type="time"
                        value={restriction.end_time}
                        onChange={(e) => updateRestrictionTime(index, 'end_time', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Days of Week</Label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map(day => (
                        <Badge
                          key={day}
                          variant={restriction.day_of_week?.includes(day) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleExistingDay(index, day)}
                        >
                          {getDayAbbreviation(day)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add new time restriction form */}
            {showAddForm && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">New Time Restriction</CardTitle>
                </CardHeader>
                
                <CardContent className="py-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-start-time">Start Time</Label>
                      <Input
                        id="new-start-time"
                        type="time"
                        value={newRestriction.start_time}
                        onChange={(e) => setNewRestriction({
                          ...newRestriction,
                          start_time: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-end-time">End Time</Label>
                      <Input
                        id="new-end-time"
                        type="time"
                        value={newRestriction.end_time}
                        onChange={(e) => setNewRestriction({
                          ...newRestriction,
                          end_time: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Days of Week</Label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map(day => (
                        <Badge
                          key={day}
                          variant={newRestriction.day_of_week?.includes(day) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleDay(day)}
                        >
                          {getDayAbbreviation(day)}
                        </Badge>
                      ))}
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
                    onClick={handleAddRestriction}
                  >
                    Add Restriction
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
          
          {!showAddForm && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Restriction
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TimeRestrictionEditor;
