import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ChargerConfig } from '@/types/charger';
import { useCharger } from '@/modules/chargers/hooks';
import { Plus, Pencil, Save, X, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ChargerConfigTableProps {
  configs: ChargerConfig[];
  chargerId: string;
  isLoading?: boolean;
  onRefetch?: () => void;
}

export const ChargerConfigTable: React.FC<ChargerConfigTableProps> = ({ 
  configs, 
  chargerId,
  isLoading,
  onRefetch 
}) => {
  const { toast } = useToast();
  const { 
    createConfig, 
    updateConfig, 
    deleteConfig, 
    isCreatingConfig, 
    isUpdatingConfig, 
    isDeletingConfig 
  } = useCharger();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newConfig, setNewConfig] = useState<Partial<ChargerConfig>>({
    charger: chargerId,
    key: "",
    value: "",
    readonly: false
  });
  
  // Start editing a config
  const startEditing = (config: ChargerConfig) => {
    setEditingId(config.id?.toString() || null);
    setEditedValue(config.value);
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditedValue("");
  };
  
  // Save edited value
  const saveEditing = async (config: ChargerConfig) => {
    if (!editingId) return;
    
    try {
      await updateConfig({
        id: editingId,
        configData: {
          ...config,
          value: editedValue,
        }
      });
      
      toast({
        title: "Success",
        description: "Configuration updated successfully",
      });
      
      setEditingId(null);
      setEditedValue("");
      if (onRefetch) onRefetch();
    } catch (error) {
      console.error("Update config error:", error);
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive",
      });
    }
  };
  
  // Create new config
  const handleCreateConfig = async () => {
    try {
      await createConfig({
        charger: chargerId,
        key: newConfig.key || "",
        value: newConfig.value || "",
        readonly: newConfig.readonly || false
      } as ChargerConfig);
      
      toast({
        title: "Success",
        description: "Configuration created successfully",
      });
      
      setIsAddDialogOpen(false);
      setNewConfig({
        charger: chargerId,
        key: "",
        value: "",
        readonly: false
      });
      
      if (onRefetch) onRefetch();
    } catch (error) {
      console.error("Create config error:", error);
      toast({
        title: "Error",
        description: "Failed to create configuration",
        variant: "destructive",
      });
    }
  };
  
  // Delete config
  const handleDeleteConfig = async (id: string) => {
    try {
      await deleteConfig(id);
      
      toast({
        title: "Success",
        description: "Configuration deleted successfully",
      });
      
      if (onRefetch) onRefetch();
    } catch (error) {
      console.error("Delete config error:", error);
      toast({
        title: "Error",
        description: "Failed to delete configuration",
        variant: "destructive",
      });
    }
  };
  
  const columns: Column<ChargerConfig>[] = [
    { header: "Key", accessorKey: "key" },
    { 
      header: "Value", 
      accessorKey: "value",
      cell: (config) => (
        editingId === config.id?.toString() ? (
          <Input 
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            className="h-8"
          />
        ) : (
          config.value
        )
      )
    },
    { 
      header: "Readonly", 
      accessorKey: "readonly",
      cell: (config) => config.readonly ? "Yes" : "No"
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (config) => (
        <div className="flex items-center gap-2 justify-end">
          {editingId === config.id?.toString() ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => saveEditing(config)} 
                disabled={isUpdatingConfig}
                title="Save"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={cancelEditing}
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => startEditing(config)} 
                disabled={config.readonly}
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDeleteConfig(config.id!.toString())}
                disabled={isDeletingConfig}
                title="Delete"
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
      className: "text-right"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Charger Configurations</h3>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Configuration
        </Button>
      </div>
      
      <DataTable
        columns={columns}
        data={configs}
        keyField="id"
        emptyMessage="No configurations found"
        isLoading={isLoading || isUpdatingConfig || isDeletingConfig}
      />
      
      {/* Add Configuration Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Configuration</DialogTitle>
            <DialogDescription>
              Add a new configuration parameter for this charger.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key">Key</Label>
              <Input 
                id="key" 
                value={newConfig.key}
                onChange={(e) => setNewConfig({...newConfig, key: e.target.value})}
                placeholder="Enter configuration key"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input 
                id="value" 
                value={newConfig.value}
                onChange={(e) => setNewConfig({...newConfig, value: e.target.value})}
                placeholder="Enter configuration value"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="readonly">Read Only</Label>
              <Switch 
                id="readonly"
                checked={newConfig.readonly}
                onCheckedChange={(checked) => setNewConfig({...newConfig, readonly: checked})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateConfig}
              disabled={isCreatingConfig || !newConfig.key || !newConfig.value}
            >
              {isCreatingConfig ? "Creating..." : "Create Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
