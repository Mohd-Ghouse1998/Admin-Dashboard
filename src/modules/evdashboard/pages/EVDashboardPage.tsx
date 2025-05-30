import React, { useState, useCallback } from 'react';
import { 
  useOverview, 
  useStatusDistribution, 
  useMapData, 
  useMonthlyChartData,
  useYearlyChartData,
  useTopSessionsData,
  useTopRevenueData,
  useChargerUtilization,
  useChargerDistribution
} from '../hooks/useDashboardData';
import { TabsView, TabPanel } from '../components/TabsView';
import { KPICard } from '../components/KPICard';
import { ChargerStatusChart } from '../components/ChargerStatusChart';
import { ConnectorStatusChart } from '../components/ConnectorStatusChart';
import { ActiveSessions } from '../components/ActiveSessions';
import { ChargerMap } from '../components/ChargerMap';
import { EnergyConsumptionChart } from '../components/EnergyConsumptionChart';
import { TopPerformers } from '../components/TopPerformers';
import { SessionsTable } from '../components/temp/SessionsTable';

// Import our new Chart component
interface ChargerFilterOptions {
  timePeriod: 'daily' | 'weekly' | 'monthly' | 'yearly';
  chartType: 'energy' | 'revenue' | 'sessions' | 'users' | 'chargers';
  viewMode: 'performers' | 'distribution';
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  sortBy?: 'utilization_rate' | 'revenue' | 'energy_delivered' | 'sessions' | 'hours_active' | 'availability_rate';
  reverse?: boolean;
  groupBy?: 'location' | 'is_online' | 'connector_count';
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Chart } from '../components/Chart';
import { 
  Activity, BatteryCharging, Bolt, DollarSign, 
  PlugZap, LucideIcon, Zap, Settings, User, Calendar,
  AlertTriangle, Map as MapIcon
} from 'lucide-react';

const EVDashboardPage: React.FC = () => {
  // Removed the chart toggle state since we no longer have both chart components
  // State for charger filter options
  const [chargerFilterOptions, setChargerFilterOptions] = useState<ChargerFilterOptions>({
    timePeriod: 'monthly',
    chartType: 'energy',  // Default chart type
    viewMode: 'performers', // Default view mode
    limit: 15,
    sortBy: 'utilization_rate',
    reverse: true,
    groupBy: 'location'
  });
  // Reference to the tab elements for navigation
  const tabRefs = {
    sessions: React.useRef<HTMLButtonElement>(null),
    map: React.useRef<HTMLButtonElement>(null),
    charts: React.useRef<HTMLButtonElement>(null)
  };
  // Fetch data for Overview tab
  const { 
    data: overviewData, 
    isLoading: isLoadingOverview, 
    error: errorOverview 
  } = useOverview();
  
  // Fetch data for Status Distribution
  const { 
    data: statusData, 
    isLoading: isLoadingStatus, 
    error: errorStatus 
  } = useStatusDistribution();
  
  // Fetch data for Map View
  const { 
    data: mapData, 
    isLoading: isLoadingMap, 
    error: errorMap 
  } = useMapData();
  
  // Fetch data for Charts
  const { 
    data: monthlyData, 
    isLoading: isLoadingMonthly, 
    error: errorMonthly 
  } = useMonthlyChartData(12);
  
  const { 
    data: yearlyData, 
    isLoading: isLoadingYearly, 
    error: errorYearly 
  } = useYearlyChartData(5);
  
  const { 
    data: topSessionsData, 
    isLoading: isLoadingTopSessions, 
    error: errorTopSessions 
  } = useTopSessionsData(5);
  
  const { 
    data: topRevenueData, 
    isLoading: isLoadingTopRevenue, 
    error: errorTopRevenue 
  } = useTopRevenueData(5);
  
  // Fetch data for Charger Utilization
  const {
    data: chargerUtilizationData,
    isLoading: isLoadingChargerUtilization,
    error: errorChargerUtilization
  } = useChargerUtilization(chargerFilterOptions);
  
  // Use the same data for both utilization and distribution
  // This fixes the type mismatch by not making a separate API call for distribution data
  const chargerDistributionData = chargerUtilizationData;
  const isLoadingChargerDistribution = isLoadingChargerUtilization;
  const errorChargerDistribution = errorChargerUtilization;
  
  // Handle filter changes - memoized with useCallback to prevent creating new function reference on each render
  const handleFilterChange = useCallback((options: ChargerFilterOptions) => {
    setChargerFilterOptions(prevOptions => {
      // Only update if the options are actually different
      if (
        prevOptions.timePeriod !== options.timePeriod ||
        prevOptions.limit !== options.limit ||
        prevOptions.sortBy !== options.sortBy ||
        prevOptions.reverse !== options.reverse ||
        prevOptions.groupBy !== options.groupBy ||
        prevOptions.dateFrom !== options.dateFrom ||
        prevOptions.dateTo !== options.dateTo
      ) {
        return options;
      }
      return prevOptions;
    });
  }, []);
  
  // Main KPI cards data for Overview tab
  const kpiCardsData = [
    {
      title: 'Total Chargers',
      value: overviewData?.total_chargers || 0,
      icon: <PlugZap className="h-5 w-5" />,
      iconColor: 'bg-blue-50 text-blue-500',
      description: 'Active and inactive chargers'
    },
    {
      title: 'Online Chargers',
      value: overviewData?.online_chargers || 0,
      icon: <BatteryCharging className="h-5 w-5" />,
      iconColor: 'bg-green-50 text-green-500',
      description: `${Math.round((overviewData?.online_chargers || 0) / (overviewData?.total_chargers || 1) * 100)}% online`
    },
    {
      title: 'Enabled Chargers',
      value: overviewData?.enabled_chargers || 0,
      icon: <Settings className="h-5 w-5" />,
      iconColor: 'bg-indigo-50 text-indigo-500',
      description: 'Ready for operation'
    },
    {
      title: 'Total Energy',
      value: `${overviewData?.total_energy?.toFixed(2) || 0} kWh`,
      icon: <Bolt className="h-5 w-5" />,
      iconColor: 'bg-yellow-50 text-yellow-500',
      description: 'Last 30 days'
    },
    {
      title: 'Total Revenue',
      value: `$${overviewData?.total_revenue?.toFixed(2) || 0}`,
      icon: <DollarSign className="h-5 w-5" />,
      iconColor: 'bg-emerald-50 text-emerald-500',
      description: 'Last 30 days'
    }
  ];
  
  // Additional KPI cards for connector status
  const connectorKpiCardsData = [
    {
      title: 'Active Sessions',
      value: overviewData?.active_sessions_count || 0,
      icon: <Activity className="h-5 w-5" />,
      iconColor: 'bg-purple-50 text-purple-500',
      description: 'Currently active sessions'
    },
    {
      title: 'Available Connectors',
      value: overviewData?.available_connectors || 0,
      icon: <PlugZap className="h-5 w-5" />,
      iconColor: 'bg-green-50 text-green-500',
      description: 'Ready for charging'
    },
    {
      title: 'In-Use Connectors',
      value: overviewData?.in_use_connectors || 0,
      icon: <Zap className="h-5 w-5" />,
      iconColor: 'bg-blue-50 text-blue-500',
      description: 'Currently charging'
    },
    {
      title: 'Faulted Connectors',
      value: overviewData?.faulted_connectors || 0,
      icon: <AlertTriangle className="h-5 w-5" />,
      iconColor: 'bg-red-50 text-red-500',
      description: 'Require attention'
    }
  ];
  
  // Today's metrics KPI cards
  const todayKpiCardsData = [
    {
      title: "Today's Sessions",
      value: overviewData?.sessions_today || 0,
      icon: <Calendar className="h-5 w-5" />,
      iconColor: 'bg-purple-50 text-purple-500',
      description: 'Sessions started today'
    },
    {
      title: "Today's Energy",
      value: `${overviewData?.energy_today?.toFixed(2) || 0} kWh`,
      icon: <Zap className="h-5 w-5" />,
      iconColor: 'bg-amber-50 text-amber-500',
      description: 'Energy delivered today'
    },
    {
      title: "Today's Revenue",
      value: `$${overviewData?.revenue_today?.toFixed(2) || 0}`,
      icon: <DollarSign className="h-5 w-5" />,
      iconColor: 'bg-green-50 text-green-500',
      description: 'Revenue generated today'
    }
  ];

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">EV Charging Dashboard</h1>
      
      <TabsView defaultValue="overview">
        {/* Overview Tab */}
        <TabPanel value="overview">
          {/* Main KPI Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {kpiCardsData.map((card, index) => (
              <KPICard
                key={index}
                title={card.title}
                value={card.value}
                icon={card.icon}
                description={card.description}
                iconColor={card.iconColor}
              />
            ))}
          </div>
          
          {/* Additional Connector KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {connectorKpiCardsData.map((card, index) => (
              <KPICard
                key={index}
                title={card.title}
                value={card.value}
                icon={card.icon}
                description={card.description}
                iconColor={card.iconColor}
              />
            ))}
          </div>
          
          {/* Status Chart */}
          <div className="grid grid-cols-1 mb-6">
            <ChargerStatusChart
              data={statusData?.status_distribution || []}
              title="Charger Status Distribution"
              isLoading={isLoadingStatus}
              error={errorStatus}
              onlineDistribution={statusData?.online_distribution || []}
              totalChargers={statusData?.total_chargers || 0}
              totalConnectors={statusData?.total_connectors || 0}
            />
          </div>
          
          {/* Today's Metrics Card */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-md font-medium">Today's Metrics</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {todayKpiCardsData.map((card, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={cn("p-2 rounded-full", card.iconColor)}>
                        {card.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{card.title}</h3>
                        <div className="text-xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground">{card.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Active Sessions */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <ActiveSessions
              data={overviewData?.active_session_details || []}
              isLoading={isLoadingOverview}
              error={errorOverview}
            />
          </div>
          
          {/* Energy Consumption Chart */}
          <div className="grid grid-cols-1 gap-4">
            <EnergyConsumptionChart
              monthlyData={monthlyData}
              yearlyData={yearlyData}
              isLoadingMonthly={isLoadingMonthly}
              isLoadingYearly={isLoadingYearly}
              errorMonthly={errorMonthly}
              errorYearly={errorYearly}
            />
          </div>
        </TabPanel>
        
        {/* Map View Tab */}
        <TabPanel value="map" className="h-[calc(100vh-180px)]">
          <ChargerMap
            locations={mapData?.charger_locations || []}
            isLoading={isLoadingMap}
            error={errorMap}
          />
        </TabPanel>
        
        {/* Charts Tab */}
        <TabPanel value="charts" className="h-[calc(100vh-180px)] overflow-auto">
          <Chart
            monthlyData={monthlyData}
            yearlyData={yearlyData}
            topSessionsData={topSessionsData}
            topRevenueData={topRevenueData}
            chargerUtilizationData={chargerUtilizationData}
            chargerDistributionData={chargerUtilizationData}
            isLoadingMonthly={isLoadingMonthly}
            isLoadingYearly={isLoadingYearly}
            isLoadingTopSessions={isLoadingTopSessions}
            isLoadingTopRevenue={isLoadingTopRevenue}
            isLoadingChargerUtilization={isLoadingChargerUtilization}
            isLoadingChargerDistribution={isLoadingChargerUtilization}
            errorMonthly={errorMonthly}
            errorYearly={errorYearly}
            errorTopSessions={errorTopSessions}
            errorTopRevenue={errorTopRevenue}
            errorChargerUtilization={errorChargerUtilization}
            errorChargerDistribution={errorChargerUtilization}
            onFilterChange={handleFilterChange}
          />
        </TabPanel>
        
        {/* Sessions Tab */}
        <TabPanel value="sessions">
          <SessionsTable />
        </TabPanel>
      </TabsView>
    </div>
  );
};

export default EVDashboardPage;
