import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Power, RotateCw, Trash2, Zap, AlertCircle, MessageSquare, Download, Settings, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ListTemplateHeader } from '@/components/templates/list/ListTemplateHeader';

const RemoteOperationsDashboard = () => {
  const operations = [
    {
      title: 'Start Transaction',
      description: 'Remotely start a charging transaction on a specific charger and connector',
      icon: <Zap className="h-5 w-5 text-green-600" />,
      href: '/chargers/remote-operations/start',
      color: 'bg-green-50',
    },
    {
      title: 'Stop Transaction',
      description: 'Remotely stop an active charging transaction',
      icon: <Power className="h-5 w-5 text-red-600" />,
      href: '/chargers/remote-operations/stop',
      color: 'bg-red-50',
    },
    {
      title: 'Reset Charger',
      description: 'Perform a soft or hard reset of a charger',
      icon: <RotateCw className="h-5 w-5 text-amber-600" />,
      href: '/chargers/remote-operations/reset',
      color: 'bg-amber-50',
    },
    {
      title: 'Clear Cache',
      description: 'Clear the authorization cache from a charger',
      icon: <Trash2 className="h-5 w-5 text-purple-600" />,
      href: '/chargers/remote-operations/clear-cache',
      color: 'bg-purple-50',
    },
    {
      title: 'Change Availability',
      description: 'Set a charger or connector as operative or inoperative',
      icon: <Power className="h-5 w-5 text-blue-600" />,
      href: '/chargers/remote-operations/change-availability',
      color: 'bg-blue-50',
    },
    {
      title: 'Trigger Diagnostic Message',
      description: 'Request diagnostic messages from chargers',
      icon: <MessageSquare className="h-5 w-5 text-indigo-600" />,
      href: '/chargers/remote-operations/trigger-message',
      color: 'bg-indigo-50',
    },
    {
      title: 'Update Firmware',
      description: 'Schedule a firmware update for a charger',
      icon: <Download className="h-5 w-5 text-cyan-600" />,
      href: '/chargers/remote-operations/update-firmware',
      color: 'bg-cyan-50',
    },
    {
      title: 'Get Configuration',
      description: 'Retrieve the current configuration of a charger',
      icon: <AlertCircle className="h-5 w-5 text-emerald-600" />,
      href: '/chargers/remote-operations/get-config',
      color: 'bg-emerald-50',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Remote Operations | EV Admin</title>
      </Helmet>
      
      <div className="space-y-6 p-6 max-w-screen-xl mx-auto">
        <ListTemplateHeader
          title="Remote Operations"
          description="Manage chargers and connectors remotely through OCPP commands"
          icon={<Settings className="h-5 w-5" />}
          createButtonText=""
        />
        
        <div className="shadow-md border border-gray-100 rounded-lg overflow-hidden bg-white">
          <div className="bg-blue-50/50 p-4 border-b border-blue-100/50 text-sm text-gray-700">

          <p className="flex items-start">
            <AlertCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
            Remote operations allow you to control chargers through OCPP commands. Select an operation below to proceed.
          </p>
          </div>


          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {operations.map((op) => (
            <Link 
              key={op.title} 
              to={op.href}
              className="no-underline text-foreground group"
            >
              <div className={cn(
                "h-full transition-all rounded-xl border shadow-sm overflow-hidden",
                "group-hover:shadow-md group-hover:border-primary/20 group-hover:translate-y-[-2px] duration-300",
                "flex flex-col bg-white"
              )}>
                <div className={cn(
                  "p-4 flex items-center space-x-3 border-b",
                  op.color
                )}>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    {op.icon}
                  </div>
                  <h3 className="text-base font-semibold">{op.title}</h3>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-sm text-gray-600 mb-4 flex-1">
                    {op.description}
                  </p>
                  <div className="mt-auto pt-2 border-t border-gray-100">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-between text-primary hover:text-primary-dark font-medium"
                    >
                      Launch 
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RemoteOperationsDashboard;
