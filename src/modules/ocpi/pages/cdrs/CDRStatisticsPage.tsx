import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, LineChart, BarChart, PieChart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { OCPIApiService } from '@/modules/ocpi/services';
import type { CDRQueryParams } from '@/modules/ocpi/types';
import { formatCurrency, formatNumberWithUnit } from '@/utils/formatters';
import { useOCPIRole } from '@/modules/ocpi/contexts/OCPIRoleContext';

// Mock components for charts - in a real implementation, you'd use a charting library like recharts
const LineChartComponent = ({ data, xKey, yKey, title }: any) => (
  <div className="h-80 w-full border rounded-md p-4 flex items-center justify-center">
    <LineChart className="h-10 w-10 mr-2" />
    <span>{title || 'Line Chart'} (Placeholder)</span>
  </div>
);

const BarChartComponent = ({ data, xKey, yKey, title }: any) => (
  <div className="h-80 w-full border rounded-md p-4 flex items-center justify-center">
    <BarChart className="h-10 w-10 mr-2" />
    <span>{title || 'Bar Chart'} (Placeholder)</span>
  </div>
);

const PieChartComponent = ({ data, nameKey, valueKey, title }: any) => (
  <div className="h-80 w-full border rounded-md p-4 flex items-center justify-center">
    <PieChart className="h-10 w-10 mr-2" />
    <span>{title || 'Pie Chart'} (Placeholder)</span>
  </div>
);

const CDRStatisticsPage: React.FC = () => {
  const { toast } = useToast();
  const { role } = useOCPIRole();
  
  // State for filters
  const [filters, setFilters] = useState<CDRQueryParams>({
    from_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0],
    group_by: 'day',
  });
  
  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Fetch CDR statistics based on role and filters
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cdr-statistics', filters, role],
    queryFn: async () => {
      try {
        const response = role === 'CPO' 
          ? await OCPIApiService.cpo.cdrs.getStatistics(filters)
          : await OCPIApiService.emsp.cdrs.getStatistics(filters);
        return response.data;
      } catch (error) {
        console.error('Error fetching CDR statistics:', error);
        throw error;
      }
    },
    enabled: true,
  });

  // Handle exporting statistics
  const handleExport = async () => {
    try {
      let response;
      if (role === 'CPO') {
        response = await OCPIApiService.cpo.cdrs.export({
          ...filters,
          format: 'statistics',
        });
      } else if (role === 'EMSP') {
        response = await OCPIApiService.emsp.cdrs.export({
          ...filters,
          format: 'statistics',
        });
      } else {
        response = await OCPIApiService.cpo.cdrs.export({
          ...filters,
          format: 'statistics',
        });
      }
      
      // Create a download link for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cdr-statistics-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: 'Export Successful',
        description: 'CDR statistics have been exported successfully',
      });
    } catch (error) {
      console.error('Error exporting CDR statistics:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export CDR statistics. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Calculate summary statistics
  const summary = data ? {
    totalCDRs: data.total_cdrs || 0,
    totalEnergy: data.total_energy || 0,
    totalCost: data.total_cost || 0,
    averageEnergy: data.avg_energy || 0,
    averageCost: data.avg_cost || 0,
    currency: data.currency || 'USD',
  } : {
    totalCDRs: 0,
    totalEnergy: 0,
    totalCost: 0,
    averageEnergy: 0,
    averageCost: 0,
    currency: 'USD',
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CDR Analytics</h1>
          <p className="text-muted-foreground">
            View and analyze Charge Detail Record statistics
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Statistics
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total CDRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCDRs}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Energy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumberWithUnit(summary.totalEnergy, 'kWh', 2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalCost, summary.currency)}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="grid gap-2">
            <Label>Start Date</Label>
            <DatePicker
              date={filters.from_date ? new Date(filters.from_date) : undefined}
              onSelect={(date) => handleFilterChange('from_date', date ? date.toISOString().split('T')[0] : undefined)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label>End Date</Label>
            <DatePicker
              date={filters.to_date ? new Date(filters.to_date) : undefined}
              onSelect={(date) => handleFilterChange('to_date', date ? date.toISOString().split('T')[0] : undefined)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Group By</Label>
            <Select
              value={filters.group_by || 'day'}
              onValueChange={(value) => handleFilterChange('group_by', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grouping" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="location">Location</SelectItem>
                <SelectItem value="connector">Connector</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2 items-end">
            <Button onClick={() => refetch()}>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="energy" className="w-full">
        <TabsList>
          <TabsTrigger value="energy">Energy Consumption</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="comparison">Comparisons</TabsTrigger>
        </TabsList>
        
        <TabsContent value="energy">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Energy Consumption Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">Loading...</div>
                ) : isError ? (
                  <div className="h-80 flex items-center justify-center text-red-500">
                    Error loading data
                  </div>
                ) : (
                  <LineChartComponent
                    data={data?.energy_by_time || []}
                    xKey="date"
                    yKey="energy"
                    title="Energy Consumption (kWh)"
                  />
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Energy by Location</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-80 flex items-center justify-center">Loading...</div>
                  ) : isError ? (
                    <div className="h-80 flex items-center justify-center text-red-500">
                      Error loading data
                    </div>
                  ) : (
                    <PieChartComponent
                      data={data?.energy_by_location || []}
                      nameKey="location_id"
                      valueKey="energy"
                      title="Energy by Location"
                    />
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Energy by Connector Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-80 flex items-center justify-center">Loading...</div>
                  ) : isError ? (
                    <div className="h-80 flex items-center justify-center text-red-500">
                      Error loading data
                    </div>
                  ) : (
                    <BarChartComponent
                      data={data?.energy_by_connector || []}
                      xKey="connector_type"
                      yKey="energy"
                      title="Energy by Connector Type"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">Loading...</div>
                ) : isError ? (
                  <div className="h-80 flex items-center justify-center text-red-500">
                    Error loading data
                  </div>
                ) : (
                  <LineChartComponent
                    data={data?.revenue_by_time || []}
                    xKey="date"
                    yKey="revenue"
                    title={`Revenue (${summary.currency})`}
                  />
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Location</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-80 flex items-center justify-center">Loading...</div>
                  ) : isError ? (
                    <div className="h-80 flex items-center justify-center text-red-500">
                      Error loading data
                    </div>
                  ) : (
                    <PieChartComponent
                      data={data?.revenue_by_location || []}
                      nameKey="location_id"
                      valueKey="revenue"
                      title="Revenue by Location"
                    />
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Average Revenue Per Session</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-80 flex items-center justify-center">Loading...</div>
                  ) : isError ? (
                    <div className="h-80 flex items-center justify-center text-red-500">
                      Error loading data
                    </div>
                  ) : (
                    <BarChartComponent
                      data={data?.revenue_per_session || []}
                      xKey="date"
                      yKey="avg_revenue"
                      title="Average Revenue Per Session"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="usage">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Number of Sessions Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">Loading...</div>
                ) : isError ? (
                  <div className="h-80 flex items-center justify-center text-red-500">
                    Error loading data
                  </div>
                ) : (
                  <LineChartComponent
                    data={data?.sessions_by_time || []}
                    xKey="date"
                    yKey="sessions"
                    title="Number of Sessions"
                  />
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Average Session Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-80 flex items-center justify-center">Loading...</div>
                  ) : isError ? (
                    <div className="h-80 flex items-center justify-center text-red-500">
                      Error loading data
                    </div>
                  ) : (
                    <BarChartComponent
                      data={data?.avg_duration_by_time || []}
                      xKey="date"
                      yKey="avg_duration"
                      title="Average Session Duration (minutes)"
                    />
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Distribution by Authentication Method</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-80 flex items-center justify-center">Loading...</div>
                  ) : isError ? (
                    <div className="h-80 flex items-center justify-center text-red-500">
                      Error loading data
                    </div>
                  ) : (
                    <PieChartComponent
                      data={data?.auth_method_distribution || []}
                      nameKey="auth_method"
                      valueKey="count"
                      title="Authentication Methods"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="comparison">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Energy vs. Revenue Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">Loading...</div>
                ) : isError ? (
                  <div className="h-80 flex items-center justify-center text-red-500">
                    Error loading data
                  </div>
                ) : (
                  <LineChartComponent
                    data={data?.energy_vs_revenue || []}
                    xKey="date"
                    yKey={["energy", "revenue"]}
                    title="Energy vs. Revenue"
                  />
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Peak Hours Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-80 flex items-center justify-center">Loading...</div>
                  ) : isError ? (
                    <div className="h-80 flex items-center justify-center text-red-500">
                      Error loading data
                    </div>
                  ) : (
                    <BarChartComponent
                      data={data?.peak_hours || []}
                      xKey="hour"
                      yKey="sessions"
                      title="Sessions by Hour of Day"
                    />
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-80 flex items-center justify-center">Loading...</div>
                  ) : isError ? (
                    <div className="h-80 flex items-center justify-center text-red-500">
                      Error loading data
                    </div>
                  ) : (
                    <BarChartComponent
                      data={data?.weekly_patterns || []}
                      xKey="day"
                      yKey="sessions"
                      title="Sessions by Day of Week"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CDRStatisticsPage;
