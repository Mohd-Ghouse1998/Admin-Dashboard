
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DeviceDetailPage = () => {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Device Detail</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Device ID: {id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Device detail interface will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceDetailPage;
