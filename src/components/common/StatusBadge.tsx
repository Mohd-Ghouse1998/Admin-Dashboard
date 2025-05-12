
import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType = 
  | 'active'
  | 'inactive'
  | 'pending'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'default'
  | 'available'
  | 'occupied'
  | 'charging'
  | 'outofservice'
  | 'reserved'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function StatusBadge({ status, className, size = 'md', label }: StatusBadgeProps) {
  const displayLabel = label || status;
  
  const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-blue-100 text-blue-800 border-blue-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    available: 'bg-green-100 text-green-800 border-green-200',
    occupied: 'bg-orange-100 text-orange-800 border-orange-200',
    charging: 'bg-blue-100 text-blue-800 border-blue-200',
    outofservice: 'bg-red-100 text-red-800 border-red-200',
    reserved: 'bg-purple-100 text-purple-800 border-purple-200',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
  };
  
  // Default styling if status is not recognized
  const statusColor = statusColors[status.toLowerCase()] || statusColors.default;
  
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-medium',
        statusColor,
        sizeClasses[size],
        className
      )}
    >
      {status === 'active' || status === 'available' || status === 'success' ? (
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-600"></span>
      ) : status === 'inactive' || status === 'error' || status === 'outofservice' ? (
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-600"></span>
      ) : status === 'pending' || status === 'warning' ? (
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-yellow-600"></span>
      ) : status === 'charging' || status === 'info' ? (
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-blue-600"></span>
      ) : null}
      <span className="capitalize">{displayLabel}</span>
    </span>
  );
}

export default StatusBadge;
