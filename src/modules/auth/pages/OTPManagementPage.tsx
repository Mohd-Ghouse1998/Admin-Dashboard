
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OTPManagement = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">OTP Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>One-Time Passwords</CardTitle>
        </CardHeader>
        <CardContent>
          <p>OTP management interface will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPManagement;
