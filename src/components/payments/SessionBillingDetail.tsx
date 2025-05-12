
import React from 'react';
import { format } from 'date-fns';
import { SessionBilling } from '@/types/payment.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDuration } from '@/utils/formatters';
import { Skeleton } from '@/components/ui/skeleton';

interface SessionBillingDetailProps {
  sessionBilling: SessionBilling;
  isLoading?: boolean;
}

export function SessionBillingDetail({ sessionBilling, isLoading = false }: SessionBillingDetailProps) {
  if (isLoading) {
    return <SessionBillingDetailSkeleton />;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Billing Details</CardTitle>
        <CardDescription>Charging session billing information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Session ID</h3>
              <p className="mt-1 text-sm font-semibold">{sessionBilling.session_id}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
              <p className="mt-1 text-lg font-semibold">
                {formatCurrency(sessionBilling.amount)}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Energy Consumed</h3>
              <p className="mt-1 text-sm">{sessionBilling.kwh_consumed.toFixed(2)} kWh</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Duration</h3>
              <p className="mt-1 text-sm">{formatDuration(sessionBilling.time_consumed_seconds)}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">User</h3>
              <p className="mt-1 text-sm">{sessionBilling.user.username} ({sessionBilling.user.email})</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Charger</h3>
              <p className="mt-1 text-sm">
                {sessionBilling.charger.name} 
                {sessionBilling.charger.location && ` (${sessionBilling.charger.location})`}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Connector</h3>
              <p className="mt-1 text-sm">{sessionBilling.connector_id}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
              <p className="mt-1 text-sm">
                {format(new Date(sessionBilling.created_at), "PPpp")}
              </p>
            </div>
          </div>
        </div>
        
        {sessionBilling.billing_components && sessionBilling.billing_components.length > 0 && (
          <div className="mt-8">
            <h3 className="text-md font-medium mb-3">Billing Breakdown</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Component
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessionBilling.billing_components.map((component, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {component.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatCurrency(component.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {component.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-6 py-3 text-right text-sm font-medium">Total</td>
                    <td className="px-6 py-3 text-sm font-bold">
                      {formatCurrency(sessionBilling.amount)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SessionBillingDetailSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-1" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-48" />
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-48" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8">
          <Skeleton className="h-5 w-40 mb-3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
