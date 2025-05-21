import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
  User, Phone, MapPin, Globe, Shield, CheckCircle, XCircle, AlertCircle,
  Mail, Calendar, Clock, Edit, Copy, Info, FileText, Key, Home, IdCard, Building,
  Shield as ShieldIcon, Lock, Unlock
} from 'lucide-react';
import profileService from '@/modules/users/services/profileService';
import { UserProfile } from '@/modules/users/services/profileService';
import { toast } from '@/hooks/use-toast';
import DetailTemplate from '@/components/templates/detail/DetailTemplate';
import { DetailSection } from '@/components/templates/detail/DetailSection';
import { DetailInfoGrid, DetailInfoItem } from '@/components/templates/detail/DetailInfoGrid';

const ProfileDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Local state to handle loading and error states
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Check if we're viewing the current user profile or a specific profile
  const isCurrentUserProfile = location.pathname.includes('/user_profile');
  
  // Function to directly fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        let response;
        if (isCurrentUserProfile) {
          response = await profileService.getCurrentUserProfile();
        } else {
          if (!id) throw new Error('Profile ID is required');
          const numericId = Number(id);
          if (isNaN(numericId)) throw new Error(`Invalid profile ID: ${id}`);
          
          response = await profileService.getProfile(numericId);
        }
        
        // Extract profile from response
        const profileData = response?.data;
        
        if (!profileData) {
          throw new Error('No profile data returned from API');
        }
        
        setProfile(profileData);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err : new Error('Failed to load profile'));
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [id, isCurrentUserProfile]);
  
  // Function to copy text to clipboard
  const copyToClipboard = (text: string, successMessage: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied!',
        description: successMessage,
      });
    });
  };
  
  // Function to render verification badge
  const renderVerificationBadge = (isVerified: boolean) => (
    <Badge 
      className={isVerified ? 
        "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : 
        "bg-gray-100 text-gray-800 hover:bg-gray-200"}
    >
      {isVerified ? (
        <span className="flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5" />
          Verified
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <XCircle className="h-3.5 w-3.5" />
          Unverified
        </span>
      )}
    </Badge>
  );

  // Define edit action
  const handleEdit = () => {
    navigate(`/users/profiles/${id}/edit`);
  };
  
  // If loading, show the loading state of the detail template
  if (isLoading) {
    return (
      <DetailTemplate
        title="Profile Details"
        avatar={
          <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              <IdCard className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        }
        backPath="/users/profiles"
        isLoading={true}
      />
    );
  }
  
  // If error, show error state
  if (error) {
    return (
      <DetailTemplate
        title="Profile Details"
        avatar={
          <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              <IdCard className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        }
        badge={{
          text: 'Error',
          variant: 'destructive'
        }}
        backPath="/users/profiles"
        error={error}
      />
    );
  }
  
  // If no profile, show empty state
  if (!profile) {
    return (
      <DetailTemplate
        title="Profile Not Found"
        avatar={
          <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              <AlertCircle className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        }
        badge={{
          text: 'Not Found',
          variant: 'destructive'
        }}
        backPath="/users/profiles"
        description="The requested profile could not be found"
      />
    );
  }
  
  return (
    <DetailTemplate
      title="Profile Details"
      subtitle={`ID: ${profile.id}`}
      description="User profile information and verification status"
      avatar={
        <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
          <AvatarFallback className="bg-primary/10 text-primary text-xl">
            <IdCard className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
      }
      badge={{
        text: profile.is_email_verified ? 'Verified' : 'Unverified',
        variant: profile.is_email_verified ? 'success' : 'destructive'
      }}
      backPath="/users/profiles"
      editPath={`/users/profiles/${profile.id}/edit`}
      
      // Actions for this profile - using proper variant types
      actions={[
        {
          label: 'Verify Email',
          onClick: () => toast({ 
            title: "Verification email sent", 
            description: "A verification email has been sent to the user" 
          }),
          variant: "outline" as const,
          className: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 hover:text-blue-700",
          icon: <Mail className="h-4 w-4" />
        },
        ...(profile.phone_number ? [{
          label: 'Verify Phone',
          onClick: () => toast({ 
            title: "Verification SMS sent", 
            description: "A verification SMS has been sent to the user" 
          }),
          variant: "outline" as const,
          className: "bg-green-50 text-green-600 border-green-100 hover:bg-green-100 hover:text-green-700",
          icon: <Phone className="h-4 w-4" />
        }] : [])
      ]}
    >
      <div className="space-y-6">
        {/* User Profile Card */}
        <DetailSection 
          title="Profile Information" 
          icon={<IdCard className="h-5 w-5 text-primary" />}
          className="border border-primary/10"
          description="User identification and verification status"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and ID column */}
            <div className="md:w-1/3 flex flex-col items-center md:items-start">
              <div className="flex flex-col items-center gap-4 w-full">
                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    {profile.id.toString().slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center md:text-left w-full">
                  <div className="text-xl font-semibold mb-1">User ID: {profile.id}</div>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge variant="outline" className="flex items-center gap-1.5 px-2 py-0.5 border-primary/20 bg-primary/5">
                      <User className="h-3.5 w-3.5 text-primary" />
                      User Profile
                    </Badge>
                    
                    {profile.is_email_verified ? (
                      <Badge className="bg-emerald-50 text-emerald-700 flex items-center gap-1.5 px-2 py-0.5 border border-emerald-200">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 flex items-center gap-1.5 px-2 py-0.5 border border-amber-200">
                        <XCircle className="h-3.5 w-3.5" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Details column */}
            <div className="md:w-2/3 space-y-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone verification */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Phone Number</div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">
                      {profile.phone_number ? profile.phone_number : 'Not provided'}
                    </div>
                    {profile.phone_number && (
                      <Badge 
                        className={profile.is_phone_verified ? 
                          "bg-emerald-50 text-emerald-700 border border-emerald-100" : 
                          "bg-amber-50 text-amber-700 border border-amber-100"}
                      >
                        {profile.is_phone_verified ? (
                          <span className="flex items-center gap-1.5">
                            <Lock className="h-3 w-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Unlock className="h-3 w-3" />
                            Unverified
                          </span>
                        )}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Email verification */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Email Status</div>
                  <div>
                    <Badge 
                      className={profile.is_email_verified ? 
                        "bg-emerald-50 text-emerald-700 border border-emerald-100" : 
                        "bg-amber-50 text-amber-700 border border-amber-100"}
                    >
                      {profile.is_email_verified ? (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <XCircle className="h-3.5 w-3.5" />
                          Unverified
                        </span>
                      )}
                    </Badge>
                  </div>
                </div>
                
                {/* Address */}
                <div className="col-span-2 space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Address</div>
                  <div className="p-3 rounded bg-gray-50 border border-gray-100">
                    {profile.address ? profile.address : 'No address provided'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Location Details */}
        <DetailSection 
          title="Location Details" 
          icon={<MapPin className="h-5 w-5 text-primary" />}
          className="border border-primary/10"
          description="City, state and pin code information"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">City</span>
              <span className="font-medium">{profile.city || 'Not specified'}</span>
            </div>
            
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">State</span>
              <span className="font-medium">{profile.state || 'Not specified'}</span>
            </div>
            
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">PIN Code</span>
              <span className="font-medium">{profile.pin || 'Not specified'}</span>
            </div>
          </div>
        </DetailSection>

        {/* OCPI Information Section - Only show if there's OCPI data */}
        {(profile.ocpi_party_id || profile.ocpi_role || profile.ocpi_token) && (
          <DetailSection 
            title="OCPI Information" 
            icon={<Globe className="h-5 w-5 text-primary" />}
            className="border border-primary/10"
            description="Open Charge Point Interface configuration"
          >
            <DetailInfoGrid className="p-6">
              {profile.ocpi_role && (
                <DetailInfoItem
                  label="OCPI Role"
                  value={
                    <div className="flex items-center gap-2">
                      {profile.ocpi_role}
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 rounded-full">
                        Active
                      </Badge>
                    </div>
                  }
                  icon={<Globe className="h-4 w-4" />}
                />
              )}
              
              {profile.ocpi_party_id && (
                <DetailInfoItem
                  label="Party ID"
                  value={profile.ocpi_party_id}
                  icon={<Key className="h-4 w-4" />}
                  copyable
                />
              )}
              
              {profile.ocpi_token && (
                <DetailInfoItem
                  label="OCPI Token"
                  value={
                    <div className="p-3 rounded bg-primary/5 border border-primary/10 font-mono text-sm overflow-x-auto">
                      {profile.ocpi_token}
                    </div>
                  }
                  icon={<ShieldIcon className="h-4 w-4" />}
                  action={
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                      onClick={() => copyToClipboard(profile.ocpi_token, 'OCPI Token copied to clipboard')}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy
                    </Button>
                  }
                />
              )}
            </DetailInfoGrid>
          </DetailSection>
        )}

        {/* Verification Timeline */}
        <DetailSection 
          title="Verification Timeline" 
          icon={<Clock className="h-5 w-5 text-primary" />}
          className="border border-primary/10"
          description="History of verification activities"
        >
          <Card className="border-primary/10">
            <div className="p-4 space-y-4">
              {/* Email Verification Timeline Item */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ring-4 ring-white ${profile.is_email_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    <Mail className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold">Email Verification</h4>
                        <Badge 
                          className={profile.is_email_verified ? 
                            "bg-emerald-50 text-emerald-700 border border-emerald-200" : 
                            "bg-amber-50 text-amber-700 border border-amber-200"}
                        >
                          {profile.is_email_verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {profile.is_email_verified 
                          ? 'Email was successfully verified' 
                          : 'Email verification is still pending'}
                      </p>
                    </div>
                    <div className="bg-gray-50 px-3 py-1 rounded-full text-xs font-medium text-gray-500 mt-2 md:mt-0 self-start">
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  {!profile.is_email_verified && (
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 text-xs border-primary/20 bg-primary/5"
                        onClick={() => toast({ 
                          title: "Verification email sent", 
                          description: "A verification email has been sent to the user" 
                        })}
                      >
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                        Send Verification Email
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Phone Verification Timeline Item */}
              {profile.phone_number && (
                <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                  <div className="flex flex-col items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ring-4 ring-white ${profile.is_phone_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      <Phone className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold">Phone Verification</h4>
                          <Badge 
                            className={profile.is_phone_verified ? 
                              "bg-emerald-50 text-emerald-700 border border-emerald-200" : 
                              "bg-amber-50 text-amber-700 border border-amber-200"}
                          >
                            {profile.is_phone_verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {profile.is_phone_verified 
                            ? 'Phone number was successfully verified' 
                            : 'Phone number verification is still pending'}
                        </p>
                      </div>
                      <div className="bg-gray-50 px-3 py-1 rounded-full text-xs font-medium text-gray-500 mt-2 md:mt-0 self-start">
                        {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    {!profile.is_phone_verified && (
                      <div className="mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 text-xs border-primary/20 bg-primary/5"
                          onClick={() => toast({ 
                            title: "Verification SMS sent", 
                            description: "A verification SMS has been sent to the user" 
                          })}
                        >
                          <Phone className="h-3.5 w-3.5 mr-1.5" />
                          Send Verification SMS
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </DetailSection>
      </div>
    </DetailTemplate>
  );
};

export default ProfileDetailPage;
