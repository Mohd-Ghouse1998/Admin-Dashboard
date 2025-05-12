
import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { UnfoldCard } from '@/components/ui/unfold-card';
import { ChargerStatusChart } from '@/components/dashboard/ChargerStatusChart';
import { EnergyConsumptionChart } from '@/components/dashboard/EnergyConsumptionChart';
import { RevenueBreakdownChart } from '@/components/dashboard/RevenueBreakdownChart';
import { DashboardMap } from '@/components/dashboard/DashboardMap';
import { 
  Battery, BatteryCharging, Bolt, Calendar, 
  CircleCheck, CirclePause, CircleX, Clock, 
  Users, Zap, ChartBar, Power, Wrench, Sun, Wind,
  TrendingUp, TrendingDown
} from 'lucide-react';

import '@/styles/dashboard.css';

// Mock stats data for the dashboard
const stats = {
  totalChargers: 125,
  enabledChargers: 118,
  onlineChargers: 105,
  offlineChargers: 13,
  availableConnectors: 142,
  inUseConnectors: 37,
  sessionsToday: 283,
  energyDelivered: "546 kWh",
  netRevenue: "₹48,250"
};

const Dashboard = () => {
  const [mapView, setMapView] = useState<'satellite' | 'street'>('street');
  const [chartTimeframe, setChartTimeframe] = useState<'day' | 'week' | 'month'>('day');
  
  // Mock recent sessions data
  const recentSessions = [
    { 
      id: 'CS12345', 
      charger: 'EVC-001', 
      user: 'John Doe', 
      startTime: '10:30 AM', 
      endTime: '11:45 AM', 
      energy: 18.5, 
      status: 'Completed', 
      cost: '₹170.25' 
    },
    { 
      id: 'CS12346', 
      charger: 'EVC-003', 
      user: 'Alice Smith', 
      startTime: '11:15 AM', 
      endTime: null, 
      energy: 12.2, 
      status: 'In Progress', 
      cost: '~₹112.24' 
    },
    { 
      id: 'CS12347', 
      charger: 'EVC-007', 
      user: 'Robert Chen', 
      startTime: '09:20 AM', 
      endTime: '10:05 AM', 
      energy: 14.7, 
      status: 'Completed', 
      cost: '₹135.24' 
    },
    { 
      id: 'CS12348', 
      charger: 'EVC-012', 
      user: 'Sarah Wilson', 
      startTime: '08:45 AM', 
      endTime: null, 
      energy: 0, 
      status: 'Error', 
      cost: '₹0.00' 
    },
    { 
      id: 'CS12349', 
      charger: 'EVC-005', 
      user: 'Michael Brown', 
      startTime: '12:10 PM', 
      endTime: null, 
      energy: 7.8, 
      status: 'In Progress', 
      cost: '~₹71.76' 
    }
  ];

  // Session columns definition
  const sessionColumns = [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Charger', accessorKey: 'charger' },
    { header: 'User', accessorKey: 'user' },
    { header: 'Start', accessorKey: 'startTime' },
    { 
      header: 'End', 
      accessorKey: 'endTime',
      cell: (row: any) => row.endTime || '—'
    },
    { 
      header: 'Energy', 
      accessorKey: 'energy',
      cell: (row: any) => `${row.energy} kWh`
    },
    { 
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => {
        let variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'neutral';
        
        switch (row.status) {
          case 'Completed':
            variant = 'success';
            break;
          case 'In Progress':
            variant = 'info';
            break;
          case 'Error':
            variant = 'danger';
            break;
          default:
            variant = 'neutral';
        }
        
        return <StatusBadge status={row.status} variant={variant} />;
      }
    },
    { header: 'Cost', accessorKey: 'cost' },
  ];

  // Mock faults data
  const activeFaults = [
    { 
      id: 'F2345', 
      charger: 'EVC-008', 
      type: 'Communication Error', 
      severity: 'Critical', 
      time: '35 min ago' 
    },
    { 
      id: 'F2346', 
      charger: 'EVC-015', 
      type: 'Connector Damage', 
      severity: 'High', 
      time: '2 hrs ago' 
    },
    { 
      id: 'F2347', 
      charger: 'EVC-003', 
      type: 'Voltage Fluctuation', 
      severity: 'Medium', 
      time: '4 hrs ago' 
    }
  ];

  const faultsColumns = [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Charger', accessorKey: 'charger' },
    { header: 'Fault Type', accessorKey: 'type' },
    { 
      header: 'Severity',
      accessorKey: 'severity',
      cell: (row: any) => {
        let variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'neutral';
        
        switch (row.severity) {
          case 'Critical':
            variant = 'danger';
            break;
          case 'High':
            variant = 'warning';
            break;
          case 'Medium':
            variant = 'warning';
            break;
          case 'Low':
            variant = 'info';
            break;
          default:
            variant = 'neutral';
        }
        
        return <StatusBadge status={row.severity} variant={variant} />;
      }
    },
    { header: 'Reported', accessorKey: 'time' },
  ];

  return (
    <PageLayout title="Dashboard" description="EV Charging Network Overview">
      {/* KPI Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Total Chargers"
          value={stats.totalChargers.toString()}
          icon={<BatteryCharging className="h-5 w-5" />}
          variant="primary"
          trend={{
            value: 12,
            isPositive: true
          }}
        />
        
        <StatCard
          title="Enabled Chargers"
          value={stats.enabledChargers.toString()}
          icon={<BatteryCharging />}
          variant="default"
          trend={{
            value: 3.1,
            isPositive: true
          }}
        />
        
        <StatCard
          title="Online Chargers"
          value={stats.onlineChargers.toString()}
          icon={<CircleCheck />}
          variant="default"
          trend={{
            value: 1.8,
            isPositive: true
          }}
        />
        
        <StatCard
          title="Offline Chargers"
          value={stats.offlineChargers.toString()}
          icon={<CirclePause />}
          variant="default"
          trend={{
            value: 4.5,
            isPositive: false
          }}
        />
        
        <StatCard
          title="Available Connectors"
          value={stats.availableConnectors.toString()}
          icon={<Power />}
          variant="default"
          trend={{
            value: 2.3,
            isPositive: true
          }}
        />
        
        <StatCard
          title="In Use Connectors"
          value={stats.inUseConnectors.toString()}
          icon={<Bolt />}
          variant="default"
          trend={{
            value: 7.2,
            isPositive: true
          }}
        />
        
        <StatCard
          title="Sessions Today"
          value={stats.sessionsToday.toString()}
          icon={<Calendar />}
          variant="default"
          trend={{
            value: 12.5,
            isPositive: true
          }}
        />
        
        <StatCard
          title="Energy Delivered"
          value={stats.energyDelivered.toString()}
          icon={<Zap />}
          variant="default"
          trend={{
            value: 8.3,
            isPositive: true
          }}
        />
        
        <StatCard
          title="Net Revenue"
          value={stats.netRevenue.toString()}
          icon={<ChartBar />}
          variant="primary"
          trend={{
            value: 10.7,
            isPositive: true
          }}
        />
      </div>

      {/* Interactive Map Section */}
      <UnfoldCard 
        title="Charger Network Map" 
        description="Real-time status of all charging stations"
        className="mb-6 overflow-hidden"
        headerAction={
          <div className="flex items-center space-x-2">
            <Button 
              variant={mapView === 'street' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setMapView('street')}
            >
              Street
            </Button>
            <Button 
              variant={mapView === 'satellite' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setMapView('satellite')}
            >
              Satellite
            </Button>
          </div>
        }
      >
        <div className="h-[400px] w-full">
          <DashboardMap />
        </div>
      </UnfoldCard>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Energy Consumption Chart */}
        <UnfoldCard 
          title="Energy Consumption" 
          description="Energy delivered over time"
          headerAction={
            <div className="flex items-center space-x-2">
              <Button 
                variant={chartTimeframe === 'day' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setChartTimeframe('day')}
              >
                Today
              </Button>
              <Button 
                variant={chartTimeframe === 'week' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setChartTimeframe('week')}
              >
                Week
              </Button>
              <Button 
                variant={chartTimeframe === 'month' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setChartTimeframe('month')}
              >
                Month
              </Button>
            </div>
          }
        >
          <div className="h-[300px]">
            <EnergyConsumptionChart />
          </div>
        </UnfoldCard>
        
        {/* Charger Status Chart */}
        <UnfoldCard title="Charger Status Overview" description="Current status of charging stations">
          <div className="h-[300px]">
            <ChargerStatusChart />
          </div>
        </UnfoldCard>
      </div>

      {/* Recent Sessions and Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <UnfoldCard 
            title="Recent Charging Sessions" 
            description="Latest charging activities across the network"
            headerAction={
              <Button size="sm" onClick={() => window.location.href = "/chargers/charging-sessions"}>
                View All
              </Button>
            }
          >
            <DataTable
              columns={sessionColumns}
              data={recentSessions}
              keyField="id"
              emptyMessage="No recent sessions found"
              pagination={{
                currentPage: 1,
                totalPages: 1,
                onPageChange: () => {}
              }}
            />
          </UnfoldCard>
        </div>
        
        <div>
          <UnfoldCard title="Revenue Breakdown" description="Revenue sources distribution">
            <div className="h-[350px]">
              <RevenueBreakdownChart />
            </div>
          </UnfoldCard>
        </div>
      </div>

      {/* User Stats and Faults Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* User Analytics */}
        <UnfoldCard title="User Activity" description="Active users and registrations">
          <div className="p-4">
            <div className="flex items-center mb-6">
              <Users className="h-12 w-12 text-primary-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users Today</p>
                <h3 className="text-3xl font-bold">247</h3>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500 font-medium">12% increase</span>
                  <span className="text-xs text-gray-500 ml-2">vs. yesterday</span>
                </div>
              </div>
            </div>
            
            <h4 className="font-medium mb-2">Top 5 Users</h4>
            <div className="space-y-2">
              {[
                { name: "John Doe", energy: "345 kWh", sessions: "18" },
                { name: "Alice Smith", energy: "289 kWh", sessions: "15" },
                { name: "Robert Chen", energy: "253 kWh", sessions: "12" },
                { name: "Sarah Wilson", energy: "210 kWh", sessions: "11" },
                { name: "Michael Brown", energy: "198 kWh", sessions: "10" }
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="font-medium">{user.name}</span>
                  <div className="flex space-x-4">
                    <span className="text-sm">{user.energy}</span>
                    <span className="text-sm">{user.sessions} sessions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </UnfoldCard>
        
        {/* Charger Performance */}
        <UnfoldCard title="Charger Performance" description="Utilization and top locations">
          <div className="p-4">
            <div className="mb-4">
              <h4 className="font-medium mb-2">Top Locations</h4>
              <div className="space-y-2">
                {[
                  { location: "Central Mall", revenue: "₹4,256", sessions: "42" },
                  { location: "City Center", revenue: "₹3,890", sessions: "39" },
                  { location: "Tech Park", revenue: "₹3,512", sessions: "35" },
                  { location: "Airport", revenue: "₹2,980", sessions: "28" },
                  { location: "Metro Station", revenue: "₹2,745", sessions: "27" }
                ].map((location, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-medium">{location.location}</span>
                    <div className="flex space-x-4">
                      <span className="text-sm">{location.revenue}</span>
                      <span className="text-sm">{location.sessions} sessions</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Network Uptime</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Last 30 days</span>
                  <span className="font-bold text-green-600">98.7%</span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '98.7%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </UnfoldCard>
        
        {/* Faults Dashboard */}
        <UnfoldCard 
          title="Active Faults" 
          description="Current issues requiring attention"
          headerAction={
            <Button variant="outline" size="sm" onClick={() => console.log('View all faults')}>
              View All
            </Button>
          }
        >
          <DataTable
            columns={faultsColumns}
            data={activeFaults}
            keyField="id"
            emptyMessage="No active faults found"
            pagination={{
              currentPage: 1,
              totalPages: 1,
              onPageChange: () => {}
            }}
          />
        </UnfoldCard>
      </div>

      {/* Quick Actions and Environmental Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <UnfoldCard title="Quick Actions" description="Common management tasks">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
            <Button className="flex flex-col h-auto py-4" variant="outline">
              <Battery className="h-6 w-6 mb-1" />
              <span>Add Charger</span>
            </Button>
            <Button className="flex flex-col h-auto py-4" variant="outline">
              <Bolt className="h-6 w-6 mb-1" />
              <span>Remote Start</span>
            </Button>
            <Button className="flex flex-col h-auto py-4" variant="outline">
              <ChartBar className="h-6 w-6 mb-1" />
              <span>Generate Report</span>
            </Button>
            <Button className="flex flex-col h-auto py-4" variant="outline">
              <CircleX className="h-6 w-6 mb-1" />
              <span>View Faults</span>
            </Button>
            <Button className="flex flex-col h-auto py-4" variant="outline">
              <Wrench className="h-6 w-6 mb-1" />
              <span>Maintenance</span>
            </Button>
            <Button className="flex flex-col h-auto py-4" variant="outline">
              <Power className="h-6 w-6 mb-1" />
              <span>Health Check</span>
            </Button>
          </div>
        </UnfoldCard>
        
        {/* Environmental Impact */}
        <UnfoldCard title="Environmental Impact" className="lg:col-span-2" description="Positive effects of EV charging">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {/* CO₂ Saved */}
            <div className="text-center">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-full inline-flex items-center justify-center mb-3">
                <Sun className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold">14,250 kg</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">CO₂ Emissions Saved</p>
            </div>
            
            {/* Trees Equivalent */}
            <div className="text-center">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-full inline-flex items-center justify-center mb-3">
                <Wind className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold">476</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Trees Planted Equivalent</p>
            </div>
            
            {/* Cars Offset */}
            <div className="text-center">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-full inline-flex items-center justify-center mb-3">
                <Clock className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold">126</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cars Removed Equivalent</p>
            </div>
            
            <div className="col-span-1 md:col-span-3">
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 mt-4">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-1000" 
                  style={{ width: '68%' }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>YTD Progress: 68%</span>
                <span>Goal: 20,000 kg CO₂</span>
              </div>
            </div>
          </div>
        </UnfoldCard>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
