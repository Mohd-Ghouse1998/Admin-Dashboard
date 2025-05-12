import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Power, RotateCw, Trash2, Zap, AlertCircle, MessageSquare, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RemoteOperationsDashboard = () => {
  const operations = [
    {
      title: 'Start Transaction',
      description: 'Remotely start a charging transaction on a specific charger and connector',
      icon: <Zap className="h-8 w-8 text-green-500" />,
      href: '/chargers/session-controls/start',
      color: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: 'Stop Transaction',
      description: 'Remotely stop an active charging transaction',
      icon: <Power className="h-8 w-8 text-red-500" />,
      href: '/chargers/session-controls/stop',
      color: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      title: 'Reset Charger',
      description: 'Perform a soft or hard reset of a charger',
      icon: <RotateCw className="h-8 w-8 text-amber-500" />,
      href: '/chargers/remote-operations/reset',
      color: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      title: 'Clear Cache',
      description: 'Clear the authorization cache from a charger',
      icon: <Trash2 className="h-8 w-8 text-purple-500" />,
      href: '/chargers/remote-operations/clear-cache',
      color: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      title: 'Change Availability',
      description: 'Set a charger or connector as operative or inoperative',
      icon: <Power className="h-8 w-8 text-blue-500" />,
      href: '/chargers/remote-operations/change-availability',
      color: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Trigger Diagnostic Message',
      description: 'Request diagnostic messages from chargers',
      icon: <MessageSquare className="h-8 w-8 text-indigo-500" />,
      href: '/chargers/remote-operations/trigger-message',
      color: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    },
    {
      title: 'Update Firmware',
      description: 'Schedule a firmware update for a charger',
      icon: <Download className="h-8 w-8 text-cyan-500" />,
      href: '/chargers/remote-operations/update-firmware',
      color: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
    },
    {
      title: 'Get Configuration',
      description: 'Retrieve the current configuration of a charger',
      icon: <AlertCircle className="h-8 w-8 text-emerald-500" />,
      href: '/chargers/remote-operations/get-config',
      color: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
  ];

  return (
    <PageLayout
      title="Remote Operations"
      description="Manage chargers and connectors remotely through OCPP commands"
    >
      <Helmet>
        <title>Remote Operations Dashboard | Electric Flow Admin</title>
      </Helmet>

      <div className="space-y-4">
        <div className="text-sm text-muted-foreground max-w-2xl">
          <p>
            Remote operations allow you to control chargers through OCPP commands. You can start and stop transactions,
            reset chargers, change availability status, and more. Select an operation below to proceed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {operations.map((op) => (
            <Link 
              key={op.title} 
              to={op.href}
              className="no-underline text-foreground"
            >
              <Card className={`hover:shadow-md transition-all ${op.color} border ${op.borderColor} h-full`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    {op.icon}
                  </div>
                  <CardTitle className="text-lg mt-2">{op.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-muted-foreground">
                    {op.description}
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    Launch &rarr;
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default RemoteOperationsDashboard;
