import React from 'react';
import { useRouter } from '@/navigation/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ChargingSessionForm from '@/modules/chargers/components/ChargingSessionForm';

export const ChargingSessionCreatePage = () => {
  const router = useRouter();
  
  return (
    <PageLayout 
      title="Create Charging Session" 
      description="Add a new charging session"
    >
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push('/chargers/charging-sessions')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sessions
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create Charging Session</CardTitle>
        </CardHeader>
        <CardContent>
          <ChargingSessionForm />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ChargingSessionCreatePage;
