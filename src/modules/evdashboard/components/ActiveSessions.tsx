import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActiveSessionDetail } from '../types/api-types';
import { Loader2, Clock, User, PlugZap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ActiveSessionsProps {
  data: ActiveSessionDetail[];
  isLoading: boolean;
  error: Error | null;
}

export const ActiveSessions: React.FC<ActiveSessionsProps> = ({ 
  data, 
  isLoading, 
  error 
}) => {
  // Helper function to format the start time
  const formatStartTime = (startTime: string) => {
    try {
      const date = new Date(startTime);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return startTime;
    }
  };

  if (isLoading) {
    return (
      <Card className="border shadow-sm h-full">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-md font-medium flex items-center">
            <PlugZap className="h-5 w-5 mr-2 text-blue-500" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border shadow-sm h-full">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-md font-medium flex items-center">
            <PlugZap className="h-5 w-5 mr-2 text-blue-500" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] p-6">
          <div className="text-center text-red-500">
            <p>Error loading data</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm h-full">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-md font-medium flex items-center">
          <PlugZap className="h-5 w-5 mr-2 text-blue-500" />
          Active Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {data && data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Charger</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Started</TableHead>
                <TableHead className="text-right">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <PlugZap className="h-4 w-4 mr-2 text-blue-500" />
                      {session.charger_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      {session.username}
                    </div>
                  </TableCell>
                  <TableCell>{formatStartTime(session.start_time)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      {session.duration_minutes} min
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className={cn("flex flex-col items-center justify-center h-[200px] p-6 text-center")}>
            <PlugZap className="h-8 w-8 mb-2 text-gray-300" />
            <p className="text-muted-foreground">No active sessions</p>
            <p className="text-xs text-muted-foreground mt-1">All chargers are currently available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
