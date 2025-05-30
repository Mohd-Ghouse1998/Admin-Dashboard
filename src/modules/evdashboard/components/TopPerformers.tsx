import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, User, Calendar, PlugZap, DollarSign, Clock } from 'lucide-react';
import { TopSessionsData, TopRevenueData } from '../types/api-types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TopPerformersProps {
  sessionsData: TopSessionsData | null;
  revenueData: TopRevenueData | null;
  isLoadingSessions: boolean;
  isLoadingRevenue: boolean;
  errorSessions: Error | null;
  errorRevenue: Error | null;
}

export const TopPerformers: React.FC<TopPerformersProps> = ({
  sessionsData,
  revenueData,
  isLoadingSessions,
  isLoadingRevenue,
  errorSessions,
  errorRevenue
}) => {
  const [viewType, setViewType] = useState<'sessions' | 'revenue'>('sessions');
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const isLoading = viewType === 'sessions' ? isLoadingSessions : isLoadingRevenue;
  const error = viewType === 'sessions' ? errorSessions : errorRevenue;
  
  if (isLoading) {
    return (
      <Card className="border shadow-sm h-full">
        <CardHeader className="pb-2 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-md font-medium flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Top Performers
            </CardTitle>
            <Select
              disabled
              value={viewType}
              onValueChange={(value: 'sessions' | 'revenue') => setViewType(value)}
            >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sessions">By Energy</SelectItem>
                <SelectItem value="revenue">By Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border shadow-sm h-full">
        <CardHeader className="pb-2 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-md font-medium flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Top Performers
            </CardTitle>
            <Select
              value={viewType}
              onValueChange={(value: 'sessions' | 'revenue') => setViewType(value)}
            >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sessions">By Energy</SelectItem>
                <SelectItem value="revenue">By Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-red-500">
            <p>Error loading data</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Sessions Data
  const renderSessionsTable = () => {
    if (!sessionsData || !sessionsData.top_chargers || sessionsData.top_chargers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <PlugZap className="h-8 w-8 mb-2 text-gray-300" />
          <p className="text-muted-foreground">No session data available</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Charger</TableHead>
            <TableHead>Total Sessions</TableHead>
            <TableHead>Total Energy</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessionsData.top_chargers.map((charger, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center">
                  <PlugZap className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">{charger.charger_name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  {charger.total_sessions}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center font-medium text-blue-600">
                  {charger.total_energy.toFixed(2)} kWh
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  // Render Revenue Data
  const renderRevenueTable = () => {
    if (!revenueData || !revenueData.top_chargers || revenueData.top_chargers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <DollarSign className="h-8 w-8 mb-2 text-gray-300" />
          <p className="text-muted-foreground">No revenue data available</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Charger</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>Sessions</TableHead>
            <TableHead>Energy</TableHead>
            <TableHead className="text-right">Avg Revenue/Session</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {revenueData.top_chargers.map((charger, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center">
                  <PlugZap className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">{charger.charger_name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center font-medium text-green-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatCurrency(charger.total_revenue)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  {charger.total_sessions}
                </div>
              </TableCell>
              <TableCell>{charger.total_energy.toFixed(2)} kWh</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end text-amber-600 font-medium">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatCurrency(charger.avg_revenue_per_session)}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card className="border shadow-sm h-full">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md font-medium flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            Top Performers
          </CardTitle>
          <Select
            value={viewType}
            onValueChange={(value: 'sessions' | 'revenue') => setViewType(value)}
          >
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sessions">By Energy</SelectItem>
              <SelectItem value="revenue">By Revenue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {viewType === 'sessions' ? renderSessionsTable() : renderRevenueTable()}
      </CardContent>
    </Card>
  );
};
