import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Power, 
  X, 
  RefreshCw, 
  Settings, 
  Clock, 
  Download,
  Zap 
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChargerCommandPanelProps {
  chargerId: string;
  connectors?: { id: number, type: string, status: string }[];
  onRemoteStart: (params: { charger_id: string, connector_id: number, id_tag: string }) => Promise<any>;
  onRemoteStop: (params: { charger_id: string, transaction_id: number }) => Promise<any>;
  onReset: (params: { charger_id: string, reset_type: "Soft" | "Hard" }) => Promise<any>;
  onClearCache: (chargerId: string) => Promise<any>;
  onGetConfiguration: (chargerId: string) => Promise<any>;
  onSetConfiguration: (params: { charger_id: string, key: string, value: string }) => Promise<any>;
  onChangeAvailability: (params: { charger_id: string, connector_id: number, type: "Operative" | "Inoperative" }) => Promise<any>;
  onTriggerMessage: (params: { charger_id: string, requested_message: string }) => Promise<any>;
  onUpdateFirmware: (params: { charger_id: string, location: string, retrieve_date: string }) => Promise<any>;
  isLoading: {
    isRemoteStarting: boolean;
    isRemoteStopping: boolean;
    isResettingCharger: boolean;
    isClearingCache: boolean;
    isSettingConfiguration: boolean;
    isChangingAvailability: boolean;
    isTriggeringMessage: boolean;
    isUpdatingFirmware: boolean;
  };
}

export const ChargerCommandPanel: React.FC<ChargerCommandPanelProps> = ({
  chargerId,
  connectors = [],
  onRemoteStart,
  onRemoteStop,
  onReset,
  onClearCache,
  onGetConfiguration,
  onSetConfiguration,
  onChangeAvailability,
  onTriggerMessage,
  onUpdateFirmware,
  isLoading
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("transactions");
  
  // Form states
  const [connectorId, setConnectorId] = useState<string>("1");
  const [idTag, setIdTag] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [resetType, setResetType] = useState<"Soft" | "Hard">("Soft");
  const [configKey, setConfigKey] = useState<string>("");
  const [configValue, setConfigValue] = useState<string>("");
  const [availabilityType, setAvailabilityType] = useState<"Operative" | "Inoperative">("Operative");
  const [connectorAvailId, setConnectorAvailId] = useState<string>("0");
  const [requestedMessage, setRequestedMessage] = useState<string>("BootNotification");
  const [firmwareLocation, setFirmwareLocation] = useState<string>("");
  const [retrieveDate, setRetrieveDate] = useState<string>("");
  
  // Response dialog
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [commandResponse, setCommandResponse] = useState<any>(null);
  const [responseTitle, setResponseTitle] = useState<string>("");
  
  const handleCommand = async (
    commandName: string, 
    commandFn: () => Promise<any>
  ) => {
    try {
      const response = await commandFn();
      
      setResponseTitle(`${commandName} Response`);
      setCommandResponse(response);
      setIsResponseDialogOpen(true);
      
      toast({
        title: "Command sent",
        description: `${commandName} command was sent successfully.`,
      });
    } catch (error) {
      console.error(`Error sending ${commandName} command:`, error);
      
      toast({
        title: "Command failed",
        description: `Failed to send ${commandName} command.`,
        variant: "destructive",
      });
      
      setResponseTitle(`${commandName} Error`);
      setCommandResponse(error);
      setIsResponseDialogOpen(true);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Charger Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>
            
            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-md font-medium mb-4">Start & Stop Transactions</h3>
                <div className="grid grid-cols-1 gap-6">
                  {/* Remote Start Section */}
                  <div className="border p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-3">Remote Start Transaction</h4>
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div>
                        <Label htmlFor="connector-id">Connector ID</Label>
                        <Select
                          value={connectorId}
                          onValueChange={setConnectorId}
                        >
                          <SelectTrigger id="connector-id">
                            <SelectValue placeholder="Select connector" />
                          </SelectTrigger>
                          <SelectContent>
                            {connectors.map((connector) => (
                              <SelectItem 
                                key={connector.id} 
                                value={connector.id.toString()}
                              >
                                Connector {connector.id} ({connector.type}) - {connector.status}
                              </SelectItem>
                            ))}
                            {connectors.length === 0 && (
                              <SelectItem value="1">Connector 1</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="id-tag">ID Tag</Label>
                        <Input
                          id="id-tag"
                          placeholder="Enter ID tag"
                          value={idTag}
                          onChange={(e) => setIdTag(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => 
                        handleCommand("Remote Start", () => 
                          onRemoteStart({
                            charger_id: chargerId,
                            connector_id: parseInt(connectorId),
                            id_tag: idTag
                          })
                        )
                      }
                      disabled={!idTag || isLoading.isRemoteStarting}
                    >
                      <Power className="h-4 w-4 mr-2" />
                      Start Transaction
                    </Button>
                  </div>
                  
                  {/* Remote Stop Section */}
                  <div className="border p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-3">Remote Stop Transaction</h4>
                    <div className="mb-4">
                      <Label htmlFor="transaction-id">Transaction ID</Label>
                      <Input
                        id="transaction-id"
                        placeholder="Enter transaction ID"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => 
                        handleCommand("Remote Stop", () => 
                          onRemoteStop({
                            charger_id: chargerId,
                            transaction_id: parseInt(transactionId)
                          })
                        )
                      }
                      disabled={!transactionId || isLoading.isRemoteStopping}
                      variant="outline"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Stop Transaction
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* System Tab */}
            <TabsContent value="system">
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-md font-medium mb-4">System Commands</h3>
                <div className="grid grid-cols-1 gap-6">
                  {/* Reset Section */}
                  <div className="border p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-3">Reset Charger</h4>
                    <div className="mb-4">
                      <Label htmlFor="reset-type">Reset Type</Label>
                      <Select
                        value={resetType}
                        onValueChange={(value) => setResetType(value as "Soft" | "Hard")}
                      >
                        <SelectTrigger id="reset-type">
                          <SelectValue placeholder="Select reset type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Soft">Soft Reset</SelectItem>
                          <SelectItem value="Hard">Hard Reset</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => 
                        handleCommand("Reset", () => 
                          onReset({
                            charger_id: chargerId,
                            reset_type: resetType
                          })
                        )
                      }
                      disabled={isLoading.isResettingCharger}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset Charger
                    </Button>
                  </div>
                  
                  {/* Clear Cache Section */}
                  <div className="border p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-3">Clear Cache</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Clears the Authorization Cache in the charge point
                    </p>
                    <Button
                      onClick={() => 
                        handleCommand("Clear Cache", () => 
                          onClearCache(chargerId)
                        )
                      }
                      disabled={isLoading.isClearingCache}
                      variant="outline"
                    >
                      Clear Authorization Cache
                    </Button>
                  </div>
                  
                  {/* Trigger Message Section */}
                  <div className="border p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-3">Trigger Message</h4>
                    <div className="mb-4">
                      <Label htmlFor="message-type">Message Type</Label>
                      <Select
                        value={requestedMessage}
                        onValueChange={setRequestedMessage}
                      >
                        <SelectTrigger id="message-type">
                          <SelectValue placeholder="Select message type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BootNotification">Boot Notification</SelectItem>
                          <SelectItem value="DiagnosticsStatusNotification">Diagnostics Status</SelectItem>
                          <SelectItem value="FirmwareStatusNotification">Firmware Status</SelectItem>
                          <SelectItem value="Heartbeat">Heartbeat</SelectItem>
                          <SelectItem value="MeterValues">Meter Values</SelectItem>
                          <SelectItem value="StatusNotification">Status Notification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => 
                        handleCommand("Trigger Message", () => 
                          onTriggerMessage({
                            charger_id: chargerId,
                            requested_message: requestedMessage
                          })
                        )
                      }
                      disabled={isLoading.isTriggeringMessage}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Trigger Message
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Configuration Tab */}
            <TabsContent value="configuration">
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-md font-medium mb-4">Configuration Management</h3>
                <div className="grid grid-cols-1 gap-6">
                  {/* Get Configuration */}
                  <div className="border p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-3">Get Configuration</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Retrieves the current configuration from the charger
                    </p>
                    <Button
                      onClick={() => 
                        handleCommand("Get Configuration", () => 
                          onGetConfiguration(chargerId)
                        )
                      }
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Get Configuration
                    </Button>
                  </div>
                  
                  {/* Set Configuration */}
                  <div className="border p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-3">Set Configuration</h4>
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div>
                        <Label htmlFor="config-key">Configuration Key</Label>
                        <Input
                          id="config-key"
                          placeholder="Enter configuration key"
                          value={configKey}
                          onChange={(e) => setConfigKey(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="config-value">Configuration Value</Label>
                        <Input
                          id="config-value"
                          placeholder="Enter configuration value"
                          value={configValue}
                          onChange={(e) => setConfigValue(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => 
                        handleCommand("Set Configuration", () => 
                          onSetConfiguration({
                            charger_id: chargerId,
                            key: configKey,
                            value: configValue
                          })
                        )
                      }
                      disabled={!configKey || !configValue || isLoading.isSettingConfiguration}
                      variant="outline"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Set Configuration
                    </Button>
                  </div>
                  
                  {/* Update Firmware */}
                  <div className="border p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-3">Update Firmware</h4>
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div>
                        <Label htmlFor="firmware-location">Firmware Location</Label>
                        <Input
                          id="firmware-location"
                          placeholder="Enter firmware URL"
                          value={firmwareLocation}
                          onChange={(e) => setFirmwareLocation(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="retrieve-date">Retrieve Date</Label>
                        <Input
                          id="retrieve-date"
                          type="datetime-local"
                          value={retrieveDate}
                          onChange={(e) => setRetrieveDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => 
                        handleCommand("Update Firmware", () => 
                          onUpdateFirmware({
                            charger_id: chargerId,
                            location: firmwareLocation,
                            retrieve_date: retrieveDate
                          })
                        )
                      }
                      disabled={!firmwareLocation || !retrieveDate || isLoading.isUpdatingFirmware}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Update Firmware
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Availability Tab */}
            <TabsContent value="availability">
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-md font-medium mb-4">Change Availability</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="connector-id-availability">Connector ID</Label>
                    <Input
                      id="connector-id-availability"
                      placeholder="Connector ID (0 for entire charger)"
                      value={connectorAvailId}
                      onChange={(e) => setConnectorAvailId(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use 0 to change availability for the entire charger
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="availability-type">Availability Type</Label>
                    <Select
                      value={availabilityType}
                      onValueChange={(value) => setAvailabilityType(value as "Operative" | "Inoperative")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operative">Operative</SelectItem>
                        <SelectItem value="Inoperative">Inoperative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => 
                      handleCommand("Change Availability", () => 
                        onChangeAvailability({
                          charger_id: chargerId,
                          connector_id: parseInt(connectorAvailId),
                          type: availabilityType
                        })
                      )
                    }
                    disabled={!connectorAvailId || isLoading.isChangingAvailability}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Change Availability
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{responseTitle}</DialogTitle>
            <DialogDescription>
              Command response details
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto max-h-60">
            <pre className="text-xs">
              {JSON.stringify(commandResponse, null, 2)}
            </pre>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsResponseDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
