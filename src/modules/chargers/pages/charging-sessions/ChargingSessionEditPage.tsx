import React from 'react';
import { useRouter } from '@/navigation/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ChargingSessionForm from '@/modules/chargers/components/ChargingSessionForm';
import { useChargingSession } from '@/modules/chargers/hooks/useChargingSession';
import { Skeleton } from '@/components/ui/skeleton';

export const ChargingSessionEditPage = () => {
  const router = useRouter();
  const id = (router.query?.id as string) || '';
  
  const { getChargingSessionById } = useChargingSession();
  const { data: session, isLoading } = getChargingSessionById(id);
  
  return (
    <PageLayout 
      title="Edit Charging Session" 
      description="Update charging session details"
    >
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push(`/chargers/charging-sessions/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Session
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Charging Session</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(8).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : session ? (
            <ChargingSessionForm 
              initialData={session} 
              isEdit={true} 
              id={id}
              isLoading={isLoading}
            />
          ) : (
            <p className="text-center">Charging session not found.</p>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ChargingSessionEditPage;
