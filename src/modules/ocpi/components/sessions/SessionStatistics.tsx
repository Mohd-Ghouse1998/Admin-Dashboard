import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OCPISessionStatistics } from '../../../types/session.types';
import { 
  Clock, 
  Zap, 
  Calendar, 
  BarChart4,
  Activity,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SessionStatisticsProps {
  statistics: OCPISessionStatistics;
  isLoading?: boolean;
}

/**
 * Component to display session statistics in a visually appealing way
 */
const SessionStatistics: React.FC<SessionStatisticsProps> = ({ statistics, isLoading = false }) => {
  // Format duration from seconds to readable format
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Activity className="h-4 w-4 mr-2 text-blue-500" />
            Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-3xl font-bold">{statistics.total_sessions}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end space-x-1 text-sm">
                <span className="text-green-600 font-medium">{statistics.active_sessions}</span>
                <span className="text-muted-foreground">active</span>
              </div>
              <div className="flex items-center justify-end space-x-1 text-sm">
                <span className="text-blue-600 font-medium">{statistics.completed_sessions}</span>
                <span className="text-muted-foreground">completed</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <Progress 
              value={(statistics.active_sessions / statistics.total_sessions) * 100} 
              className="h-1 bg-muted" 
            />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>{Math.round((statistics.active_sessions / statistics.total_sessions) * 100)}% active</span>
              <span>{Math.round((statistics.completed_sessions / statistics.total_sessions) * 100)}% completed</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Zap className="h-4 w-4 mr-2 text-amber-500" />
            Energy Delivered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">{statistics.total_energy.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">kWh total</p>
            
            <div className="mt-2 text-sm flex items-center">
              <span className="text-muted-foreground mr-1">Avg per session:</span>
              <span className="font-medium">{statistics.avg_energy.toFixed(2)} kWh</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Clock className="h-4 w-4 mr-2 text-purple-500" />
            Avg Duration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">{formatDuration(statistics.avg_duration)}</p>
            <p className="text-xs text-muted-foreground">per session</p>
            
            <div className="mt-2 text-sm flex items-center">
              <span className="text-muted-foreground mr-1">Total:</span>
              <span className="font-medium">{formatDuration(statistics.total_duration)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <BarChart4 className="h-4 w-4 mr-2 text-green-500" />
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xl font-bold">
                  {statistics.total_sessions}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Sessions today</p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end text-xl font-bold">
                {statistics.total_energy.toFixed(1)}
                <span className="text-xs ml-1 font-normal text-muted-foreground">kWh</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Energy delivered</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionStatistics;
