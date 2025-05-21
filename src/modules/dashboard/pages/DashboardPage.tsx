import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Helmet } from 'react-helmet-async';
import { 
  User, Zap, Wallet, Users, PlugZap, ChevronRight, MoreHorizontal, 
  Calendar, Clock, MapPin, BarChart3, CircleDollarSign, BatteryCharging, 
  Activity, PieChart, LineChart, Boxes, Info, AlertTriangle, 
  CheckCircle, CheckCircle2, Clock3, XCircle 
} from 'lucide-react';
import { EnergyConsumptionChart } from '@/components/dashboard/EnergyConsumptionChart';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ChargerStatusChart } from '@/components/dashboard/ChargerStatusChart';
import { DashboardMap } from '@/components/dashboard/DashboardMap';
import { RevenueBreakdownChart } from '@/components/dashboard/RevenueBreakdownChart';
import { StatCard } from '@/components/ui/stat-card';
import { ActivityCard, ActivityItem } from '@/components/ui/activity-card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import '@/styles/dashboard.css';

// Sample activities data
const recentActivities: ActivityItem[] = [
  {
    id: '1',
    title: 'New user registered',
    description: 'User ID: 56789',
    time: '5 minutes ago',
    status: 'success',
    statusText: 'Completed',
  },
  {
    id: '2',
    title: 'Payment received',
    description: 'Transaction ID: TXID-98765',
    time: '20 minutes ago',
    status: 'success',
    statusText: 'Completed',
  },
  {
    id: '3',
    title: 'Charging session started',
    description: 'Station ID: CS-001, User: Rahul Singh',
    time: '45 minutes ago',
    status: 'pending',
    statusText: 'In Progress',
  },
  {
    id: '4',
    title: 'Station maintenance scheduled',
    description: 'Station ID: CS-005, May require service',
    time: '2 hours ago',
    status: 'warning',
    statusText: 'Upcoming',
  },
  {
    id: '5',
    title: 'Charging failed',
    description: 'Station ID: CS-003, Error: Payment declined',
    time: '3 hours ago',
    status: 'error',
    statusText: 'Failed',
  }
];

// Sample alerts data
const alertActivities: ActivityItem[] = [
  {
    id: '1',
    title: 'Station offline',
    description: 'Station ID: CS-010 connectivity issue',
    time: '10 minutes ago',
    status: 'error',
    statusText: 'Critical',
  },
  {
    id: '2',
    title: 'High power consumption',
    description: 'Station ID: CS-002 power surge detected',
    time: '30 minutes ago',
    status: 'warning',
    statusText: 'Warning',
  },
  {
    id: '3',
    title: 'Billing system error',
    description: 'Payment gateway integration failed',
    time: '1 hour ago',
    status: 'error',
    statusText: 'Critical',
  },
  {
    id: '4',
    title: 'Low battery backup',
    description: 'Station ID: CS-007 backup below 20%',
    time: '2 hours ago',
    status: 'warning',
    statusText: 'Warning',
  },
];

const DashboardPage = () => {
  return (
    <PageLayout title="" description="">
      <Helmet>
        <title>Dashboard | EV Charging Admin</title>
      </Helmet>
      
      <div className="space-y-4">
        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>Date Range</span>
          </Button>
          <Button size="sm" variant="default" className="gap-1.5">
            <PlugZap className="h-4 w-4" />
            <span>Add New Station</span>
          </Button>
        </div>
        
        {/* Tabbed interface */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b border-gray-200 dark:border-gray-800 mb-4">
            <TabsList className="bg-transparent h-auto p-0 w-full justify-start">
              <TabsTrigger 
                value="overview" 
                className={cn(
                  "data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 pb-2 pt-1.5 px-4",
                  "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 text-gray-500 dark:text-gray-400",
                  "data-[state=active]:font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                )}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              
              <TabsTrigger 
                value="performance" 
                className={cn(
                  "data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 pb-2 pt-1.5 px-4",
                  "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 text-gray-500 dark:text-gray-400",
                  "data-[state=active]:font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                )}
              >
                <LineChart className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              
              <TabsTrigger 
                value="network" 
                className={cn(
                  "data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 pb-2 pt-1.5 px-4",
                  "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 text-gray-500 dark:text-gray-400"
                )}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Network
              </TabsTrigger>
              
              <TabsTrigger 
                value="activity" 
                className={cn(
                  "data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 pb-2 pt-1.5 px-4",
                  "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 text-gray-500 dark:text-gray-400"
                )}
              >
                <Activity className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <StatCard
                title="Total Energy Delivered"
                value="245,678 kWh"
                icon={<Zap className="h-5 w-5" />}
                trend={{ value: 12, isPositive: true, label: "vs last month" }}
                variant="primary"
              />
              
              <StatCard
                title="Total Revenue"
                value="₹1,897,450"
                icon={<Wallet className="h-5 w-5" />}
                trend={{ value: 8.5, isPositive: true, label: "vs last month" }}
                variant="success"
              />
              
              <StatCard
                title="Active Customers"
                value="2,814"
                icon={<Users className="h-5 w-5" />}
                trend={{ value: 5.2, isPositive: true, label: "vs last month" }}
                variant="warning"
              />
              
              <StatCard
                title="Station Availability"
                value="94.3%"
                icon={<PlugZap className="h-5 w-5" />}
                trend={{ value: 1.2, isPositive: false, label: "vs last month" }}
                variant="danger"
              />
            </div>
            
            {/* Extended KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <StatCard
                title="Avg. Session Duration"
                value="42 min"
                icon={<Clock className="h-5 w-5" />}
                trend={{ value: 3.7, isPositive: true, label: "vs last month" }}
              />
              
              <StatCard
                title="Total Charging Points"
                value="189"
                icon={<PlugZap className="h-5 w-5" />}
                trend={{ value: 5, isPositive: true, label: "new this month" }}
              />
              
              <StatCard
                title="Avg. Revenue Per User"
                value="₹674"
                icon={<CircleDollarSign className="h-5 w-5" />}
                trend={{ value: 2.1, isPositive: true, label: "vs last month" }}
              />
              
              <StatCard
                title="Total Sessions"
                value="5,284"
                icon={<BatteryCharging className="h-5 w-5" />}
                trend={{ value: 7.3, isPositive: true, label: "vs last month" }}
              />
            </div>
            
            {/* Overview charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                <EnergyConsumptionChart />
              </div>
              
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                <RevenueChart />
              </div>
            </div>
          </TabsContent>
          
          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 gap-6">
              {/* Energy Consumption Chart */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden p-5">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">Energy Consumption</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Energy usage across all charging stations</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8">Day</Button>
                    <Button size="sm" variant="default" className="h-8">Week</Button>
                    <Button size="sm" variant="outline" className="h-8">Month</Button>
                  </div>
                </div>
                <EnergyConsumptionChart />
              </div>
              
              {/* Revenue Chart */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden p-5">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">Revenue</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total revenue from all charging stations</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8">Day</Button>
                    <Button size="sm" variant="default" className="h-8">Week</Button>
                    <Button size="sm" variant="outline" className="h-8">Month</Button>
                  </div>
                </div>
                <RevenueChart />
              </div>
              
              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Charger Status Chart */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">Charger Status</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                        <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                        <DropdownMenuItem>Refresh data</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="h-[450px]">
                    <ChargerStatusChart />
                  </div>
                </div>
                
                {/* Revenue Breakdown Chart */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">Revenue Breakdown</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                        <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                        <DropdownMenuItem>Refresh data</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="h-[450px]">
                    <RevenueBreakdownChart />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Network Tab */}
          <TabsContent value="network">
            <div className="space-y-6">
              {/* Map */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">Charging Station Network</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Map view of all charging stations</p>
                </div>
                <div className="h-[600px]">
                  <DashboardMap />
                </div>
                
                {/* Map stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 border-t border-gray-100 dark:border-gray-800">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">156</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Stations</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">95</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Available Stations</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">39</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">In-Use Stations</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-red-600 dark:text-red-400">22</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Offline/Error</div>
                  </div>
                </div>
              </div>
              
              {/* Charger Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mr-3">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">95</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Available</div>
                  </div>
                </div>
                
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">39</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">In Use</div>
                  </div>
                </div>
                
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 mr-3">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">14</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Offline</div>
                  </div>
                </div>
                
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mr-3">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">8</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Fault</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <ActivityCard
                title="Recent Activities"
                activities={recentActivities.map(activity => activity.status === 'success' ? {
                  ...activity,
                  icon: <CheckCircle className="h-4 w-4 text-green-500" />
                } : activity.status === 'pending' ? {
                  ...activity,
                  icon: <Clock className="h-4 w-4 text-blue-500" />
                } : activity.status === 'warning' ? {
                  ...activity,
                  icon: <AlertTriangle className="h-4 w-4 text-amber-500" />
                } : {
                  ...activity,
                  icon: <XCircle className="h-4 w-4 text-red-500" />
                })}
                viewAllLabel="View all activities"
                viewAllUrl="/activities"
              />
              
              {/* Alerts */}
              <ActivityCard
                title="System Alerts"
                activities={alertActivities.map(activity => activity.status === 'warning' ? {
                  ...activity,
                  icon: <AlertTriangle className="h-4 w-4 text-amber-500" />
                } : {
                  ...activity,
                  icon: <XCircle className="h-4 w-4 text-red-500" />
                })}
                viewAllLabel="View all alerts"
                viewAllUrl="/alerts"
              />
            </div>
            
            {/* Charging sessions overview */}
            <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">Recent Charging Sessions</h3>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    <span>View All</span>
                    <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                      <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                      <DropdownMenuItem>Refresh data</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {Array(5).fill(0).map((_, index) => (
                  <div key={index} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          User{index + 10001}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Station CS-00{index + 1} • {10 + index * 2} kWh delivered
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ₹{(240 + index * 50).toLocaleString()}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <Clock className="mr-1 h-3 w-3" />
                          {30 + index * 10} mins
                        </div>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        index % 3 === 0 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : index % 3 === 1 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {index % 3 === 0 ? 'Completed' : index % 3 === 1 ? 'In Progress' : 'Scheduled'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                <Button 
                  variant="outline" 
                  className="w-full text-center"
                >
                  Load More
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
