
import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Edit, ArrowLeft } from 'lucide-react';
import { useProfiles } from '@/modules/users/hooks/useProfiles';
import { formatDate } from '@/lib/utils';

const ProfileDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  
  // Check if we're viewing the current user profile or a specific profile
  const isCurrentUserProfile = location.pathname.includes('/user_profile');
  
  // Use our profiles hook
  const { getProfile, getCurrentUserProfile } = useProfiles();
  
  // Get profile details - either current user's profile or a specific profile by ID
  const { 
    data: profile, 
    isLoading, 
    error 
  } = isCurrentUserProfile ? getCurrentUserProfile() : getProfile(id || '');
  
  console.log('ProfileDetailPage - isCurrentUserProfile:', isCurrentUserProfile);
  console.log('ProfileDetailPage - pathname:', location.pathname);
  console.log('ProfileDetailPage - profile data:', profile);

  return (
    <PageLayout
      title={isCurrentUserProfile ? "My Profile" : "Profile Details"}
      description={isCurrentUserProfile ? "View and manage your profile" : "View and manage profile details"}
      backButton
      backTo={isCurrentUserProfile ? "/" : "/users/profiles"}
      actions={
        <Button asChild variant="outline">
          <Link to={isCurrentUserProfile ? "/users/user_profile/edit" : `/users/profiles/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            {isCurrentUserProfile ? "Edit My Profile" : "Edit Profile"}
          </Link>
        </Button>
      }
    >
      <Helmet>
        <title>Profile Details | Admin Dashboard</title>
      </Helmet>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load profile details'}
          </AlertDescription>
        </Alert>
      )}
      
      <Button variant="outline" asChild className="mb-4">
        <Link to="/users/profiles">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profiles
        </Link>
      </Button>
      
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>
      ) : profile ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
                  <p className="text-lg font-semibold">
                    {profile.user || 'N/A'}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                  <p>{profile.phone_number || 'Not provided'}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email Verification</h3>
                  <Badge variant={profile.is_email_verified ? 'success' : 'outline'}>
                    {profile.is_email_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone Verification</h3>
                  <Badge variant={profile.is_phone_verified ? 'success' : 'outline'}>
                    {profile.is_phone_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Address Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                  <p>{profile.address || 'Not provided'}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">PIN</h3>
                  <p>{profile.pin || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>OCPI Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">OCPI Party ID</h3>
                  <p>{profile.ocpi_party_id || 'Not provided'}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">OCPI Role</h3>
                  <Badge variant={profile.ocpi_role === 'CPO' ? 'outline' : 'secondary'}>
                    {profile.ocpi_role || 'Not assigned'}
                  </Badge>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">OCPI Token</h3>
                  <p className="truncate max-w-xs">{profile.ocpi_token || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Alert>
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>Profile not found or you don't have access to view it.</AlertDescription>
        </Alert>
      )}
    </PageLayout>
  );
};

export default ProfileDetailPage;
