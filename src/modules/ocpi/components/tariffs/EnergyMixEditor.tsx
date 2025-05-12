import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Leaf, Wind, Droplet, Flame, Zap, Cpu } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface EnergySource {
  source: string;
  percentage: number;
}

export interface EnergyMix {
  energy_sources: EnergySource[];
  is_green_energy: boolean;
}

interface EnergyMixEditorProps {
  energyMix: EnergyMix;
  onChange: (energyMix: EnergyMix) => void;
}

// Energy source types according to OCPI specification
const ENERGY_SOURCES = [
  { value: 'NUCLEAR', label: 'Nuclear' },
  { value: 'GENERAL_FOSSIL', label: 'Fossil Fuels (General)' },
  { value: 'COAL', label: 'Coal' },
  { value: 'GAS', label: 'Natural Gas' },
  { value: 'GENERAL_GREEN', label: 'Green Energy (General)' },
  { value: 'SOLAR', label: 'Solar' },
  { value: 'WIND', label: 'Wind' },
  { value: 'WATER', label: 'Water' },
  { value: 'HYDRO', label: 'Hydroelectric' },
  { value: 'BIOMASS', label: 'Biomass' },
];

export const EnergyMixEditor: React.FC<EnergyMixEditorProps> = ({
  energyMix,
  onChange
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState<EnergySource>({
    source: '',
    percentage: 20
  });
  
  // Get available sources (those not already in use)
  const getAvailableSources = () => {
    const usedSources = energyMix.energy_sources.map(s => s.source);
    return ENERGY_SOURCES.filter(source => !usedSources.includes(source.value));
  };
  
  // Add new energy source
  const handleAddSource = () => {
    if (newSource.source === '') return;
    
    // Calculate remaining percentage to ensure total is 100%
    const currentTotal = energyMix.energy_sources.reduce(
      (sum, source) => sum + source.percentage, 0
    );
    
    let adjustedPercentage = newSource.percentage;
    if (currentTotal + adjustedPercentage > 100) {
      adjustedPercentage = 100 - currentTotal;
    }
    
    if (adjustedPercentage <= 0) {
      // No room for new source, need to adjust existing sources
      const newSources = energyMix.energy_sources.map(source => ({
        ...source,
        percentage: Math.floor(source.percentage * 0.8) // Reduce existing sources by 20%
      }));
      
      // Calculate new total after reduction
      const newTotal = newSources.reduce((sum, source) => sum + source.percentage, 0);
      adjustedPercentage = 100 - newTotal;
    }
    
    const updatedSources = [
      ...energyMix.energy_sources,
      {
        ...newSource,
        percentage: adjustedPercentage
      }
    ];
    
    onChange({
      ...energyMix,
      energy_sources: updatedSources
    });
    
    setNewSource({
      source: '',
      percentage: 20
    });
    setShowAddForm(false);
  };
  
  // Remove source at index
  const handleRemoveSource = (index: number) => {
    const updatedSources = [...energyMix.energy_sources];
    const removedPercentage = updatedSources[index].percentage;
    updatedSources.splice(index, 1);
    
    // Redistribute the removed percentage among remaining sources
    if (updatedSources.length > 0 && removedPercentage > 0) {
      const percentagePerSource = removedPercentage / updatedSources.length;
      updatedSources.forEach(source => {
        source.percentage += percentagePerSource;
      });
      
      // Fix rounding errors to ensure total is exactly 100%
      const total = updatedSources.reduce((sum, source) => sum + source.percentage, 0);
      if (total !== 100 && updatedSources.length > 0) {
        updatedSources[0].percentage += (100 - total);
      }
    }
    
    onChange({
      ...energyMix,
      energy_sources: updatedSources
    });
  };
  
  // Update source percentage
  const handleUpdatePercentage = (index: number, percentage: number) => {
    const updatedSources = [...energyMix.energy_sources];
    const previousPercentage = updatedSources[index].percentage;
    const percentageDifference = percentage - previousPercentage;
    
    // Update the selected source
    updatedSources[index].percentage = percentage;
    
    // Distribute the difference among other sources
    if (updatedSources.length > 1 && percentageDifference !== 0) {
      const otherSources = updatedSources.filter((_, i) => i !== index);
      const totalOtherPercentage = otherSources.reduce((sum, source) => sum + source.percentage, 0);
      
      if (totalOtherPercentage > 0) {
        otherSources.forEach((source, i) => {
          const sourceIndex = i >= index ? i + 1 : i;
          const ratio = source.percentage / totalOtherPercentage;
          updatedSources[sourceIndex].percentage -= percentageDifference * ratio;
        });
      }
    }
    
    // Ensure percentages are within bounds and fix rounding errors
    updatedSources.forEach(source => {
      source.percentage = Math.max(1, Math.min(99, Math.round(source.percentage)));
    });
    
    // Ensure total is exactly 100%
    const total = updatedSources.reduce((sum, source) => sum + source.percentage, 0);
    if (total !== 100 && updatedSources.length > 0) {
      // Find source other than the one being adjusted with the highest percentage
      const adjustIndex = updatedSources.length > 1 
        ? updatedSources.findIndex((s, i) => i !== index && s.percentage === Math.max(
            ...updatedSources.filter((_, i) => i !== index).map(s => s.percentage)
          ))
        : 0;
        
      const finalAdjustIndex = adjustIndex === -1 ? 0 : adjustIndex;
      updatedSources[finalAdjustIndex].percentage += (100 - total);
    }
    
    onChange({
      ...energyMix,
      energy_sources: updatedSources
    });
  };
  
  // Toggle green energy setting
  const handleToggleGreenEnergy = () => {
    onChange({
      ...energyMix,
      is_green_energy: !energyMix.is_green_energy
    });
  };
  
  // Get display name for energy source
  const getSourceName = (source: string) => {
    return ENERGY_SOURCES.find(s => s.value === source)?.label || source;
  };
  
  // Get icon for energy source
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'NUCLEAR':
        return <Cpu className="h-4 w-4" />;
      case 'GENERAL_FOSSIL':
      case 'COAL':
      case 'GAS':
        return <Flame className="h-4 w-4" />;
      case 'GENERAL_GREEN':
        return <Leaf className="h-4 w-4" />;
      case 'SOLAR':
        return <Zap className="h-4 w-4" />;
      case 'WIND':
        return <Wind className="h-4 w-4" />;
      case 'WATER':
      case 'HYDRO':
        return <Droplet className="h-4 w-4" />;
      default:
        return <Leaf className="h-4 w-4" />;
    }
  };
  
  // Calculate total percentage to ensure it's 100%
  const totalPercentage = energyMix.energy_sources.reduce(
    (sum, source) => sum + source.percentage, 0
  );
  
  // Check if we have available sources
  const hasAvailableSources = getAvailableSources().length > 0;
  
  // Generate colors for visualization
  const getSourceColor = (source: string, index: number) => {
    const colorMap: Record<string, string> = {
      'NUCLEAR': 'bg-purple-500',
      'GENERAL_FOSSIL': 'bg-gray-500',
      'COAL': 'bg-gray-700',
      'GAS': 'bg-gray-400',
      'GENERAL_GREEN': 'bg-green-500',
      'SOLAR': 'bg-yellow-500',
      'WIND': 'bg-blue-400',
      'WATER': 'bg-blue-600',
      'HYDRO': 'bg-blue-500',
      'BIOMASS': 'bg-green-600',
    };
    
    return colorMap[source] || `bg-emerald-${(index % 5) * 100 + 500}`;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Leaf className="h-4 w-4 mr-2 text-muted-foreground" />
          <h4 className="font-medium">Energy Mix</h4>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm || !hasAvailableSources}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Energy Source
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <Label htmlFor="is-green-energy" className="text-base">Green Energy</Label>
          <p className="text-sm text-muted-foreground">Mark this tariff as using green energy</p>
        </div>
        <Switch
          id="is-green-energy"
          checked={energyMix.is_green_energy}
          onCheckedChange={handleToggleGreenEnergy}
        />
      </div>
      
      {/* Visual representation of energy mix */}
      {energyMix.energy_sources.length > 0 && (
        <div className="space-y-2">
          <div className="flex h-8 w-full overflow-hidden rounded-md">
            {energyMix.energy_sources.map((source, index) => (
              <div
                key={index}
                className={`${getSourceColor(source.source, index)}`}
                style={{ width: `${source.percentage}%` }}
                title={`${getSourceName(source.source)}: ${source.percentage}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {energyMix.energy_sources.map((source, index) => (
              <Badge key={index} variant="outline" className={`text-xs`}>
                <div className={`w-2 h-2 rounded-full mr-1 ${getSourceColor(source.source, index)}`} />
                {getSourceName(source.source)}: {source.percentage}%
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Error if total != 100% */}
      {totalPercentage !== 100 && energyMix.energy_sources.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            Total energy mix should equal 100%. Current total: {totalPercentage}%
          </AlertDescription>
        </Alert>
      )}
      
      {energyMix.energy_sources.length === 0 && !showAddForm ? (
        <Alert>
          <AlertDescription>
            No energy sources defined. Add at least one energy source to describe the energy mix.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {/* List of energy sources */}
          {energyMix.energy_sources.map((source, index) => (
            <Card key={index}>
              <CardHeader className="py-3 flex flex-row items-center justify-between">
                <div className="flex items-center">
                  {getSourceIcon(source.source)}
                  <CardTitle className="text-base ml-2">
                    {getSourceName(source.source)}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveSource(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="py-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Percentage</Label>
                    <span>{source.percentage}%</span>
                  </div>
                  <Slider
                    value={[source.percentage]}
                    min={1}
                    max={99}
                    step={1}
                    onValueChange={([value]) => handleUpdatePercentage(index, value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Add new energy source form */}
          {showAddForm && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">New Energy Source</CardTitle>
              </CardHeader>
              
              <CardContent className="py-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-source">Energy Source</Label>
                  <Select
                    value={newSource.source}
                    onValueChange={(value) => setNewSource({...newSource, source: value})}
                  >
                    <SelectTrigger id="new-source">
                      <SelectValue placeholder="Select energy source" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableSources().map(source => (
                        <SelectItem key={source.value} value={source.value}>
                          <div className="flex items-center">
                            {getSourceIcon(source.value)}
                            <span className="ml-2">{source.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="new-percentage">Percentage</Label>
                    <span>{newSource.percentage}%</span>
                  </div>
                  <Slider
                    id="new-percentage"
                    value={[newSource.percentage]}
                    min={1}
                    max={99}
                    step={1}
                    onValueChange={([value]) => setNewSource({...newSource, percentage: value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentages of all sources will be adjusted to total 100%
                  </p>
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
                  onClick={handleAddSource}
                  disabled={newSource.source === ''}
                >
                  Add Source
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default EnergyMixEditor;
