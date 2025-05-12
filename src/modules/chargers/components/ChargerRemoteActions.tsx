import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCharger } from '@/hooks/useCharger';
import {
  RefreshCw,
  Database,
  Settings,
  Send,
  Download,
  Power
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ChargerRemoteActionsProps {
  chargerId: string;
  chargerName: string;
}

export const ChargerRemoteActions: React.FC<ChargerRemoteActionsProps> = ({
  chargerId,
  chargerName
}) => {
  const { toast } = useToast();
  const {
    resetCharger,
    clearCache,
    setConfiguration,
    triggerMessage,
    updateFirmware,
    isResettingCharger,
    isClearingCache,
    isSettingConfiguration,
    isTriggeringMessage,
    isUpdatingFirmware
  } = useCharger();
  
  // Dialog states
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isFirmwareDialogOpen, setIsFirmwareDialogOpen] = useState(false);
  
  // Form states
  const [resetType, setResetType] = useState<'Soft' | 'Hard'>('Soft');
  const [configKey, setConfigKey] = useState('');
  const [configValue, setConfigValue] = useState('');
  const [messageType, setMessageType] = useState('StatusNotification');
  const [connectorId, setConnectorId] = useState('');
  const [firmwareLocation, setFirmwareLocation] = useState('');
  const [retrieveDate, setRetrieveDate] = useState('');
  
  // Handle reset charger
  const handleResetCharger = async () => {
    try {
      await resetCharger({
        charger_id: chargerId,
        reset_type: resetType
      });
      
      toast({
        title: "Success",
        description: `${resetType} reset initiated on ${chargerName}`,
      });
      
      setIsResetDialogOpen(false);
    } catch (error) {
      console.error("Reset error:", error);
      toast({
        title: "Error",
        description: "Failed to reset charger",
        variant: "destructive",
      });
    }
  };
  
  // Handle clear cache
  const handleClearCache = async () => {
    try {
      await clearCache(chargerId);
      
      toast({
        title: "Success",
        description: `Cache cleared on ${chargerName}`,
      });
    } catch (error) {
      console.error("Clear cache error:", error);
      toast({
        title: "Error",
        description: "Failed to clear cache",
        variant: "destructive",
      });
    }
  };
  
  // Handle set configuration
  const handleSetConfig = async () => {
    if (!configKey || !configValue) return;
    
    try {
      await setConfiguration({
        charger_id: chargerId,
        key: configKey,
        value: configValue
      });
      
      toast({
        title: "Success",
        description: `Configuration set successfully on ${chargerName}`,
      });
      
      setIsConfigDialogOpen(false);
      setConfigKey('');
      setConfigValue('');
    } catch (error) {
      console.error("Set config error:", error);
      toast({
        title: "Error",
        description: "Failed to set configuration",
        variant: "destructive",
      });
    }
  };
  
  // Handle trigger message
  const handleTriggerMessage = async () => {
    try {
      await triggerMessage({
        charger_id: chargerId,
        requested_message: messageType,
        connector_id: connectorId ? parseInt(connectorId, 10) : undefined
      });
      
      toast({
        title: "Success",
        description: `${messageType} message triggered on ${chargerName}`,
      });
      
      setIsMessageDialogOpen(false);
    } catch (error) {
      console.error("Trigger message error:", error);
      toast({
        title: "Error",
        description: "Failed to trigger message",
        variant: "destructive",
      });
    }
  };
  
  // Handle update firmware
  const handleUpdateFirmware = async () => {
    if (!firmwareLocation || !retrieveDate) return;
    
    try {
      await updateFirmware({
        charger_id: chargerId,
        location: firmwareLocation,
        retrieve_date: retrieveDate
      });
      
      toast({
        title: "Success",
        description: `Firmware update scheduled for ${chargerName}`,
      });
      
      setIsFirmwareDialogOpen(false);
      setFirmwareLocation('');
      setRetrieveDate('');
    } catch (error) {
      console.error("Update firmware error:", error);
      toast({
        title: "Error",
        description: "Failed to schedule firmware update",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Remote Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="flex items-center justify-start"
          onClick={() => setIsResetDialogOpen(true)}
          disabled={isResettingCharger}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {isResettingCharger ? "Resetting..." : "Reset Charger"}
        </Button>
        
        <Button
          variant="outline"
          className="flex items-center justify-start"
          onClick={handleClearCache}
          disabled={isClearingCache}
        >
          <Database className="mr-2 h-4 w-4" />
          {isClearingCache ? "Clearing..." : "Clear Cache"}
        </Button>
        
        <Button
          variant="outline"
          className="flex items-center justify-start"
          onClick={() => setIsConfigDialogOpen(true)}
          disabled={isSettingConfiguration}
        >
          <Settings className="mr-2 h-4 w-4" />
          {isSettingConfiguration ? "Setting..." : "Change Configuration"}
        </Button>
        
        <Button
          variant="outline"
          className="flex items-center justify-start"
          onClick={() => setIsMessageDialogOpen(true)}
          disabled={isTriggeringMessage}
        >
          <Send className="mr-2 h-4 w-4" />
          {isTriggeringMessage ? "Triggering..." : "Trigger Message"}
        </Button>
        
        <Button
          variant="outline"
          className="flex items-center justify-start"
          onClick={() => setIsFirmwareDialogOpen(true)}
          disabled={isUpdatingFirmware}
        >
          <Download className="mr-2 h-4 w-4" />
          {isUpdatingFirmware ? "Updating..." : "Update Firmware"}
        </Button>
        
        <Button
          variant="outline"
          className="flex items-center justify-start"
          onClick={() => window.open(`/chargers/remote-control?charger_id=${chargerId}`, '_blank')}
        >
          <Power className="mr-2 h-4 w-4" />
          Advanced Control
        </Button>
      
      {/* Reset Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Charger</DialogTitle>
            <DialogDescription>
              Select the type of reset to perform.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reset Type</Label>
              <Select onValueChange={(value) => setResetType(value as 'Soft' | 'Hard')} value={resetType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reset type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soft">Soft Reset</SelectItem>
                  <SelectItem value="Hard">Hard Reset</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsResetDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleResetCharger}
              disabled={isResettingCharger}
            >
              {isResettingCharger ? "Resetting..." : "Reset Charger"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Configuration</DialogTitle>
            <DialogDescription>
              Set configuration parameters for the charger.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="configKey">Configuration Key</Label>
              <Input 
                id="configKey" 
                value={configKey}
                onChange={(e) => setConfigKey(e.target.value)}
                placeholder="Enter configuration key"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="configValue">Configuration Value</Label>
              <Input 
                id="configValue" 
                value={configValue}
                onChange={(e) => setConfigValue(e.target.value)}
                placeholder="Enter configuration value"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConfigDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSetConfig}
              disabled={isSettingConfiguration || !configKey || !configValue}
            >
              {isSettingConfiguration ? "Setting..." : "Set Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Trigger Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trigger Message</DialogTitle>
            <DialogDescription>
              Request the charger to send a specific message.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="messageType">Message Type</Label>
              <Select onValueChange={setMessageType} value={messageType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select message type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BootNotification">Boot Notification</SelectItem>
                  <SelectItem value="StatusNotification">Status Notification</SelectItem>
                  <SelectItem value="Heartbeat">Heartbeat</SelectItem>
                  <SelectItem value="MeterValues">Meter Values</SelectItem>
                  <SelectItem value="DiagnosticsStatusNotification">Diagnostics Status</SelectItem>
                  <SelectItem value="FirmwareStatusNotification">Firmware Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="connectorId">Connector ID (optional)</Label>
              <Input 
                id="connectorId" 
                type="number"
                value={connectorId}
                onChange={(e) => setConnectorId(e.target.value)}
                placeholder="Enter connector ID"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsMessageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleTriggerMessage}
              disabled={isTriggeringMessage || !messageType}
            >
              {isTriggeringMessage ? "Triggering..." : "Trigger Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Update Firmware Dialog */}
      <Dialog open={isFirmwareDialogOpen} onOpenChange={setIsFirmwareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Firmware</DialogTitle>
            <DialogDescription>
              Instruct the charger to update its firmware.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="firmwareLocation">Firmware URL</Label>
              <Input 
                id="firmwareLocation" 
                value={firmwareLocation}
                onChange={(e) => setFirmwareLocation(e.target.value)}
                placeholder="Enter firmware URL"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retrieveDate">Retrieve Date</Label>
              <Input 
                id="retrieveDate" 
                type="datetime-local"
                value={retrieveDate}
                onChange={(e) => setRetrieveDate(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsFirmwareDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateFirmware}
              disabled={isUpdatingFirmware || !firmwareLocation || !retrieveDate}
            >
              {isUpdatingFirmware ? "Updating..." : "Update Firmware"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  </Card>
  );
};
