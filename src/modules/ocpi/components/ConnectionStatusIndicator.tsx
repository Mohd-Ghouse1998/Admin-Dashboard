import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, CheckCircle, Clock, RefreshCw, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { OCPIApiService } from '../services';

export type ConnectionStatus = 'active' | 'pending' | 'error' | 'inactive' | 'unknown';

interface ConnectionStatusIndicatorProps {
  connectionId?: string | number;
  status?: ConnectionStatus;
  showRefresh?: boolean;
  showTooltip?: boolean;
  className?: string;
}

/**
 * ConnectionStatusIndicator - Shows the health status of connections to other parties
 * 
 * This component provides a visual indicator of the connection status, which can be:
 * - Active: Connection is established and working
 * - Pending: Connection is being established
 * - Error: Connection has encountered an error
 * - Inactive: Connection is not active
 * - Unknown: Connection status cannot be determined
 */
export function ConnectionStatusIndicator({
  connectionId,
  status: initialStatus,
  showRefresh = true,
  showTooltip = true,
  className = '',
}: ConnectionStatusIndicatorProps) {
  // If connectionId is provided, fetch the status from the API
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ocpi', 'connection', 'status', connectionId],
    queryFn: async () => {
      if (!connectionId) return { status: initialStatus || 'unknown' };
      
      try {
        const response = await OCPIApiService.common.connections.getById(connectionId.toString());
        return response.data || response; // Handle both axios response structure and direct data return
      } catch (error) {
        console.error('Error fetching connection status:', error);
        return { status: 'error' };
      }
    },
    enabled: !!connectionId,
    refetchInterval: 60000, // Refresh every minute
  });
  
  // Use the fetched status or the initial status if no connectionId was provided
  const status = data?.status || initialStatus || 'unknown';
  
  // Status configuration
  const statusConfig = {
    active: {
      label: 'Active',
      icon: <CheckCircle className="h-4 w-4" />,
      variant: 'bg-green-100 text-green-800 border-green-300',
      description: 'Connection is established and working correctly',
    },
    pending: {
      label: 'Pending',
      icon: <Clock className="h-4 w-4" />,
      variant: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      description: 'Connection is being established',
    },
    error: {
      label: 'Error',
      icon: <AlertCircle className="h-4 w-4" />,
      variant: 'bg-red-100 text-red-800 border-red-300',
      description: 'Connection has encountered an error',
    },
    inactive: {
      label: 'Inactive',
      icon: <XCircle className="h-4 w-4" />,
      variant: 'bg-gray-100 text-gray-800 border-gray-300',
      description: 'Connection is not active',
    },
    unknown: {
      label: 'Unknown',
      icon: <AlertCircle className="h-4 w-4" />,
      variant: 'bg-gray-100 text-gray-500 border-gray-300',
      description: 'Connection status cannot be determined',
    },
  };
  
  const config = statusConfig[status];
  
  // Handle refresh button click
  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    refetch();
  };
  
  const badge = (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 ${config.variant} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
      {showRefresh && connectionId && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-4 w-4 ml-1 p-0" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </Badge>
  );
  
  if (!showTooltip) {
    return badge;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.description}</p>
          {connectionId && <p className="text-xs text-gray-500">Connection ID: {connectionId}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
