import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, ArrowRight } from 'lucide-react';

const LocationsSetupPage = () => {
  const navigate = useNavigate();

  return (
    <PageLayout
      title="OCPI Locations Setup"
      description="Step 2/4: Configure locations for OCPI integration"
      backButton
      backTo="/ocpi/cpo/dashboard"
    >
      <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
        <Card className="hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Button 
                className="w-full justify-between text-left" 
                variant="ghost" 
                size="lg"
                onClick={() => navigate('/ocpi/cpo/locations/map-chargers')}
              >
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  <span>Map Existing Chargers</span>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="ml-9">
              Convert OCPP chargers to OCPI locations automatically
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Button 
                className="w-full justify-between text-left" 
                variant="ghost" 
                size="lg"
                onClick={() => navigate('/ocpi/cpo/locations/create')}
              >
                <div className="flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-green-600" />
                  <span>Create Locations Manually</span>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="ml-9">
              Create locations one by one with custom details
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Button 
                className="w-full justify-between text-left" 
                variant="ghost" 
                size="lg"
                onClick={() => navigate('/ocpi/cpo/dashboard')}
              >
                <div className="flex items-center">
                  <ArrowRight className="h-5 w-5 mr-2 text-gray-600" />
                  <span>Skip This Step</span>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="ml-9">
              I'll set up locations later
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default LocationsSetupPage;
