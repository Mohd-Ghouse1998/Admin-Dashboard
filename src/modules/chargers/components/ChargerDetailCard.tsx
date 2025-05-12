import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Charger } from '@/types/charger';
import { 
  Edit, 
  Trash2,
  BatteryCharging,
  Cable,
  MapPin,
  Tag, 
  Zap, 
  Check,
  X,
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ChargerDetailCardProps {
  charger: Charger;
  onDelete: () => Promise<void>;
  isLoading: boolean;
}

export const ChargerDetailCard: React.FC<ChargerDetailCardProps> = ({
  charger,
  onDelete,
  isLoading
}) => {
  const navigate = useNavigate();
  
  const getStatusVariant = (status?: string): "success" | "warning" | "danger" | "info" | "neutral" => {
    switch (status) {
      case "Available":
        return "success";
      case "Preparing":
      case "SuspendedEVSE":
      case "SuspendedEV":
        return "warning";
      case "Charging":
        return "info";
      case "Faulted":
      case "Unavailable":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-semibold">{charger.name}</h2>
            <div className="flex items-center mt-2">
              <StatusBadge 
                status={charger.status || 'Unknown'} 
                variant={getStatusVariant(charger.status)} 
                className="mr-3" 
              />
              <span className="text-sm text-gray-500">
                Last Heartbeat: {charger.last_heartbeat || 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/chargers/${charger.id}/edit`)}
              disabled={isLoading}
              className="flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="text-red-500 hover:text-red-700 flex items-center"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this charger?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the charger
                    and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={onDelete}
                    className="bg-red-500 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {/* Charger Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mb-6">
          <div className="flex items-start">
            <div className="mr-3 mt-0.5">
              <Tag className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Charger ID</div>
              <div className="font-medium">{charger.charger_id}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="mr-3 mt-0.5">
              <BatteryCharging className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Type</div>
              <div className="font-medium">{charger.type || 'N/A'}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="mr-3 mt-0.5">
              <Cable className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Model</div>
              <div className="font-medium">{charger.model || 'N/A'} ({charger.vendor || 'Unknown Vendor'})</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="mr-3 mt-0.5">
              <Zap className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Price per kWh</div>
              <div className="font-medium">₹{charger.price_per_kwh?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="mr-3 mt-0.5">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Address</div>
              <div className="font-medium">{charger.address || 'No address specified'}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="mr-3 mt-0.5">
              {charger.enabled ? 
                <Check className="h-5 w-5 text-green-500" /> : 
                <X className="h-5 w-5 text-red-500" />
              }
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div className="font-medium flex items-center">
                {charger.enabled ? (
                  <span className="text-green-500">Enabled</span>
                ) : (
                  <span className="text-red-500">Disabled</span>
                )}
                {charger.publish_to_ocpi && (
                  <span className="ml-2 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    OCPI Enabled
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Registration Date */}
        <div className="text-sm text-gray-500 border-t pt-4 mt-4">
          <div>Created: {new Date(charger.created_at || '').toLocaleDateString()}</div>
          <div>Last Updated: {new Date(charger.updated_at || '').toLocaleDateString()}</div>
        </div>
      </CardContent>
    </Card>
  );
};
