import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Map, BarChart3, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabsViewProps {
  children: React.ReactNode;
  defaultValue?: string;
  className?: string;
}

export const TabsView: React.FC<TabsViewProps> = ({
  children,
  defaultValue = 'overview',
  className
}) => {
  return (
    <Tabs defaultValue={defaultValue} className={cn("w-full", className)}>
      <div className="border-b mb-6">
        <TabsList className="bg-transparent h-12">
          <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="map" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12">
            <Map className="h-4 w-4 mr-2" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="charts" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12">
            <BarChart3 className="h-4 w-4 mr-2" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="sessions" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12">
            <ListChecks className="h-4 w-4 mr-2" />
            Sessions
          </TabsTrigger>
        </TabsList>
      </div>
      {children}
    </Tabs>
  );
};

export const TabPanel: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className }) => {
  return (
    <TabsContent value={value} className={cn("mt-0", className)}>
      {children}
    </TabsContent>
  );
};
