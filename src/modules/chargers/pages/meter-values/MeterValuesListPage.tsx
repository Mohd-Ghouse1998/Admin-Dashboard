import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Filter, Search, Info, MoreHorizontal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMeterValues } from '@/modules/chargers/hooks/useMeterValues';
import type { MeterValueFilters } from '@/modules/chargers/hooks/useMeterValues';

const MeterValuesListPage = () => {
  // Filters state
  const [chargerId, setChargerId] = useState<string | undefined>();
  const [connectorId, setConnectorId] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  
  // Build filters object
  const filters: MeterValueFilters = {
    charger: chargerId,
    connector: connectorId,
    chargingSession: sessionId,
    timestampAfter: startDate,
    timestampBefore: endDate
  };
  
  // Use the hook to fetch data
  const {
    meterValues,
    isLoading,
    error,
    pagination: { currentPage, setCurrentPage, totalPages, totalItems }
  } = useMeterValues(filters);
  
  // Reset all filters
  const resetFilters = () => {
    setChargerId(undefined);
    setConnectorId(undefined);
    setSessionId(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      return timestamp;
    }
  };
  
  return (
    <PageLayout
      title="Meter Values"
      description="View and filter meter values from charging sessions"
    >
      <Helmet>
        <title>Meter Values | Electric Flow Admin</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load meter values'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filter by measurand..."
              className="pl-8 md:w-64 lg:w-80"
              // Additional search functionality could be added here
            />
          </div>
          
          <Button variant="outline" size="sm" className="h-10 px-3 lg:px-4" onClick={() => {}}>
            <Filter className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" size="sm" className="h-10" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      </div>
      
      {/* Filter options */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Charger ID</label>
          <Input
            placeholder="Filter by charger"
            value={chargerId || ''}
            onChange={(e) => setChargerId(e.target.value || undefined)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Connector ID</label>
          <Input
            placeholder="Filter by connector"
            value={connectorId || ''}
            onChange={(e) => setConnectorId(e.target.value || undefined)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Session ID</label>
          <Input
            placeholder="Filter by charging session"
            value={sessionId || ''}
            onChange={(e) => setSessionId(e.target.value || undefined)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Start Date</label>
          <Input
            type="datetime-local"
            value={startDate || ''}
            onChange={(e) => setStartDate(e.target.value || undefined)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">End Date</label>
          <Input
            type="datetime-local"
            value={endDate || ''}
            onChange={(e) => setEndDate(e.target.value || undefined)}
          />
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading meter values...</p>
                </div>
              </div>
            ) : meterValues?.results && meterValues.results.length > 0 ? (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="p-3 text-left font-medium">ID</th>
                      <th className="p-3 text-left font-medium">Value</th>
                      <th className="p-3 text-left font-medium">Unit</th>
                      <th className="p-3 text-left font-medium">Measurand</th>
                      <th className="p-3 text-left font-medium">Context</th>
                      <th className="p-3 text-left font-medium">Location</th>
                      <th className="p-3 text-left font-medium">Timestamp</th>
                      <th className="p-3 text-left font-medium">Session</th>
                      <th className="p-3 text-left font-medium">Conn.</th>
                      <th className="p-3 text-left font-medium">Charger</th>
                      <th className="p-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meterValues.results.map((meterValue) => (
                      <tr key={meterValue.id} className="hover:bg-muted/50 border-b">
                        <td className="p-3 font-medium">{meterValue.id}</td>
                        <td className="p-3">{meterValue.value}</td>
                        <td className="p-3">{meterValue.unit || '-'}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="font-normal">
                            {meterValue.measurand || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="p-3">{meterValue.context || '-'}</td>
                        <td className="p-3">{meterValue.location || '-'}</td>
                        <td className="p-3">{formatTimestamp(meterValue.timestamp)}</td>
                        <td className="p-3">
                          {meterValue.charging_session ? (
                            <Link 
                              to={`/chargers/charging-sessions/${meterValue.charging_session}`} 
                              className="text-primary hover:underline"
                            >
                              {meterValue.charging_session}
                            </Link>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3">{meterValue.connector || '-'}</td>
                        <td className="p-3">
                          {meterValue.charger ? (
                            <Link 
                              to={`/chargers/chargers/${meterValue.charger}`} 
                              className="text-primary hover:underline"
                            >
                              {meterValue.charger}
                            </Link>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="ghost" asChild>
                              <Link to={`/chargers/meter-values/${meterValue.id}`}>
                                <Info className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination controls */}
                <div className="flex items-center justify-between px-4 py-2 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Showing <span className="font-medium">{meterValues.results.length}</span> of{' '}
                      <span className="font-medium">{meterValues.count}</span> items
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1 || !meterValues.previous}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!meterValues.next || currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No meter values found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default MeterValuesListPage;
