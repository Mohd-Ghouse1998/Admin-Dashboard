
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DeviceManagementPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Device Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Device management interface will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceManagementPage;
