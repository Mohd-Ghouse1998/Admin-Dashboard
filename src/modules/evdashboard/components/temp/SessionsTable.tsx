import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export const SessionsTable: React.FC = () => {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-md font-medium">Sessions</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="bg-slate-100 p-5 rounded-full mb-4">
            <Clock className="h-10 w-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
          <p className="text-slate-500 max-w-md">
            The sessions management feature is currently under development and will be available in a future update.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionsTable;
