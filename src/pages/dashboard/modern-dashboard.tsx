/**
 * @deprecated This component is deprecated in favor of DashboardPage.
 * Please use the standard Dashboard component from modules/dashboard/pages/DashboardPage
 */

import React from 'react';
import { User, Zap, Wallet, Users, PlugZap, ChevronRight, MoreHorizontal, Calendar, Clock } from 'lucide-react';
import { EnergyConsumptionChart } from '@/modules/dashboard/components/EnergyConsumptionChart';
import { RevenueChart } from '@/modules/dashboard/components/RevenueChart';
import { StatCard } from '@/components/ui/stat-card';
import { ActivityCard, ActivityItem } from '@/components/ui/activity-card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

const ModernDashboard = () => {  // Kept as ModernDashboard for backward compatibility
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Here's what's happening with your EV charging network today.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>Date Range</span>
          </Button>
          <Button size="sm" variant="default" className="gap-1.5">
            <PlugZap className="h-4 w-4" />
            <span>Add New Station</span>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
          title="Active Users"
          value="12,847"
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 3.2, isPositive: true, label: "vs last month" }}
          variant="info"
        />

        <StatCard
          title="Charging Stations"
          value="156"
          icon={<PlugZap className="h-5 w-5" />}
          trend={{ value: 4.1, isPositive: false, label: "since last week" }}
          variant="warning"
          subtitle="12 offline"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <EnergyConsumptionChart />
        <RevenueChart />
      </div>

      {/* Activities and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ActivityCard
          title="Recent Activities"
          activities={recentActivities}
          viewAllLabel="View all activities"
          viewAllUrl="/activities"
        />

        <ActivityCard
          title="Alerts & Notifications"
          activities={alertActivities}
          viewAllLabel="View all alerts"
          viewAllUrl="/alerts"
        />
      </div>

      {/* Charging sessions overview */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
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
    </div>
  );
};

export default ModernDashboard;
