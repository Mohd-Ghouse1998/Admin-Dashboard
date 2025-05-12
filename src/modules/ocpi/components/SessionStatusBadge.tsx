import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, CheckCircle, Clock, PlayCircle, StopCircle, ZapOff } from 'lucide-react';

export type SessionStatus = 
  | 'ACTIVE' 
  | 'COMPLETED' 
  | 'INVALID' 
  | 'PENDING' 
  | 'RESERVED' 
  | 'EXPIRED'
  | 'UNKNOWN';

interface SessionStatusBadgeProps {
  status: SessionStatus;
  showTooltip?: boolean;
  className?: string;
}

/**
 * SessionStatusBadge - Displays the current status of a charging session
 * 
 * This component provides a visual indicator of the session state, which can be:
 * - ACTIVE: Session is currently charging
 * - COMPLETED: Session has finished successfully
 * - INVALID: Session has encountered an error
 * - PENDING: Session is initializing
 * - RESERVED: Connector is reserved for this session
 * - EXPIRED: Reserved session has expired
 * - UNKNOWN: Session status cannot be determined
 */
export function SessionStatusBadge({
  status,
  showTooltip = true,
  className = '',
}: SessionStatusBadgeProps) {
  // Status configuration
  const statusConfig = {
    ACTIVE: {
      label: 'Active',
      icon: <PlayCircle className="h-4 w-4" />,
      variant: 'bg-green-100 text-green-800 border-green-300',
      description: 'Session is currently charging',
    },
    COMPLETED: {
      label: 'Completed',
      icon: <CheckCircle className="h-4 w-4" />,
      variant: 'bg-blue-100 text-blue-800 border-blue-300',
      description: 'Session has finished successfully',
    },
    INVALID: {
      label: 'Invalid',
      icon: <AlertCircle className="h-4 w-4" />,
      variant: 'bg-red-100 text-red-800 border-red-300',
      description: 'Session has encountered an error',
    },
    PENDING: {
      label: 'Pending',
      icon: <Clock className="h-4 w-4" />,
      variant: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      description: 'Session is initializing',
    },
    RESERVED: {
      label: 'Reserved',
      icon: <Clock className="h-4 w-4" />,
      variant: 'bg-purple-100 text-purple-800 border-purple-300',
      description: 'Connector is reserved for this session',
    },
    EXPIRED: {
      label: 'Expired',
      icon: <StopCircle className="h-4 w-4" />,
      variant: 'bg-gray-100 text-gray-800 border-gray-300',
      description: 'Reserved session has expired',
    },
    UNKNOWN: {
      label: 'Unknown',
      icon: <ZapOff className="h-4 w-4" />,
      variant: 'bg-gray-100 text-gray-500 border-gray-300',
      description: 'Session status cannot be determined',
    },
  };
  
  const config = statusConfig[status] || statusConfig.UNKNOWN;
  
  const badge = (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 ${config.variant} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
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
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
