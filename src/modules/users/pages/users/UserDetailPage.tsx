import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@/modules/users/hooks/useUser';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User as UserIcon, Mail, Phone, MapPin, Building, 
  Shield, Calendar, CheckCircle, XCircle, 
  Globe, ClipboardCheck, Info, Copy,
  Edit, Trash2, UserCog, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DetailTemplate, { DetailSection, DetailInfoGrid, DetailInfoItem } from '@/components/templates/detail/DetailTemplate';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// User Profile interface
interface UserProfile {
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  ocpi_role?: string | null;
  ocpi_party_id?: string | null;
  ocpi_token?: string | null;
}

// User interface
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  role?: 'admin' | 'manager' | 'user';
  date_joined: string;
  last_login?: string;
  profile?: UserProfile;
}

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Get user data using the user hook
  const { getUser, deleteUser } = useUser();
  const { data, isLoading, error } = getUser(id as string);
  
  // Cast data to User type
  const user = data as User | undefined;
  
  // Function to copy text to clipboard
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: message
    });
  };

  // Function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Function to render verification badge
  const getVerificationBadge = (isVerified: boolean) => (
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
  
  // Function to get role badge
  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1.5 rounded-md py-1 px-2 text-xs">
            <Shield className="h-3.5 w-3.5" />
            Administrator
          </Badge>
        );
      case 'manager':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5 rounded-md py-1 px-2 text-xs">
            <UserCog className="h-3.5 w-3.5" />
            Manager
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1.5 rounded-md py-1 px-2 text-xs">
            <UserIcon className="h-3.5 w-3.5" />
            User
          </Badge>
        );
    }
  };
  
  // If loading, show loading state
  if (isLoading) {
    return (
      <DetailTemplate
        title="User Details"
        avatar={
          <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              <UserIcon className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        }
        backPath="/users"
        isLoading={true}
      />
    );
  }
  
  // If error, show error state
  if (error) {
    return (
      <DetailTemplate
        title="User Details"
        avatar={
          <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              <UserIcon className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        }
        badge={{
          text: 'Error',
          variant: 'destructive'
        }}
        backPath="/users"
        error={error}
      />
    );
  }
  
  // If no user data but not loading or error, show a message
  if (!user) {
    return (
      <DetailTemplate
        title="User Details"
        avatar={
          <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              <UserIcon className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        }
        badge={{
          text: 'Not Found',
          variant: 'destructive'
        }}
        backPath="/users"
      >
        <DetailSection
          title="No Data"
          icon={<Info className="h-5 w-5 text-primary" />}
          className="border border-primary/10"
        >
          <div className="p-6 text-center">
            <p className="text-muted-foreground">No user data available. Please check the user ID and try again.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </DetailSection>
      </DetailTemplate>
    );
  }
  
  // Define tabs for the detail view
  const tabs = [
    {
      value: "overview", // Fix: Changed 'id' to 'value' to match DetailTab type
      label: "Overview",
      icon: <Info className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {/* Basic Information Section */}
          <DetailSection
            title="Basic Information"
            icon={<UserCog className="h-5 w-5 text-primary" />}
            description="Personal details and account information"
            className="border border-primary/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Username</span>
                <span className="font-medium flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  {user.username}
                </span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Email</span>
                <div className="flex items-center justify-between">
                  <span className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {user.email}
                  </span>
                  <div className="flex gap-2">
                    {getVerificationBadge(user?.profile?.is_email_verified || false)}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(user.email, 'Email address copied to clipboard')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">First Name</span>
                <span className="font-medium">{user.first_name}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Last Name</span>
                <span className="font-medium">{user.last_name}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Phone Number</span>
                {user?.profile?.phone_number ? (
                  <div className="flex items-center justify-between">
                    <span className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {user.profile.phone_number}
                    </span>
                    <div className="flex gap-2">
                      {getVerificationBadge(user?.profile?.is_phone_verified || false)}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(user.profile.phone_number || '', 'Phone number copied to clipboard')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">No phone number provided</span>
                )}
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <Badge 
                  variant={user.is_active ? "default" : "secondary"} 
                  className="rounded-md py-1 px-2 w-fit"
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </DetailSection>
          
          {/* Address Information Section */}
          <DetailSection
            title="Address Information"
            icon={<MapPin className="h-5 w-5 text-primary" />}
            description="User's location and address details"
            className="border border-primary/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">City</span>
                <span className="font-medium flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  {user?.profile?.city || 'N/A'}
                </span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">State</span>
                <span className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {user?.profile?.state || 'N/A'}
                </span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">PIN Code</span>
                <span className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {user?.profile?.pin || 'N/A'}
                </span>
              </div>
              
              <div className="flex flex-col space-y-1 col-span-3">
                <span className="text-sm font-medium text-muted-foreground">Full Address</span>
                {user?.profile?.address ? (
                  <div className="p-3 rounded bg-gray-50 border border-gray-100">
                    <p>{user.profile.address}</p>
                    {(user.profile.city || user.profile.state || user.profile.pin) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        {user.profile.city && <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5" /> {user.profile.city}</span>}
                        {user.profile.state && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {user.profile.state}</span>}
                        {user.profile.pin && <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {user.profile.pin}</span>}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">No address provided</span>
                )}
              </div>
            </div>
          </DetailSection>
          
          {/* OCPI Information Section - Only show if there's OCPI data */}
          {(user?.profile?.ocpi_party_id || user?.profile?.ocpi_role || user?.profile?.ocpi_token) && (
            <DetailSection
              title="OCPI Information"
              icon={<Globe className="h-5 w-5 text-primary" />}
              description="Open Charge Point Interface information"
              className="border border-primary/10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {user?.profile?.ocpi_party_id && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">OCPI Party ID</span>
                    <div className="flex items-center justify-between">
                      <span className="font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        {user.profile.ocpi_party_id}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(user.profile.ocpi_party_id || '', 'OCPI Party ID copied to clipboard')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {user?.profile?.ocpi_role && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">OCPI Role</span>
                    <span className="font-medium">{user.profile.ocpi_role}</span>
                  </div>
                )}
                
                {user?.profile?.ocpi_token && (
                  <div className="flex flex-col space-y-1 col-span-2">
                    <span className="text-sm font-medium text-muted-foreground">OCPI Token</span>
                    <div className="relative">
                      <div className="p-3 rounded bg-gray-50 border border-gray-100 font-mono text-sm overflow-x-auto">
                        {user.profile.ocpi_token}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(user.profile.ocpi_token || '', 'OCPI Token copied to clipboard')}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DetailSection>
          )}
        </div>
      )
    }
  ];
  
  return (
    <>
      <DetailTemplate
        title={`${user?.first_name || ''} ${user?.last_name || ''}`}
        subtitle={`@${user?.username}`}
        description="User account details and information"
        avatar={
          <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {user?.first_name?.charAt(0) || ''}{user?.last_name?.charAt(0) || ''}
            </AvatarFallback>
          </Avatar>
        }
        badge={{
          text: user?.is_active ? 'Active' : 'Inactive',
          variant: user?.is_active ? 'success' : 'destructive'
        }}
        backPath="/users"
        tabs={tabs}
        defaultTab="overview"
        
        // Account actions - using proper variant types
        actions={[
          {
            label: 'Edit User',
            icon: <Edit className="h-4 w-4" />,
            variant: "outline" as const,
            className: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 hover:text-blue-700",
            onClick: () => navigate(`/users/${id}/edit`)
          },
          {
            label: 'Delete User',
            icon: <Trash2 className="h-4 w-4" />,
            variant: "destructive" as const,
            className: "bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-700",
            onClick: () => setIsDeleteDialogOpen(true)
          }
        ]}
      />
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  if (!id) return;
                  // Fix: Handle deleteUser as a mutation object, not a function
                  await deleteUser.mutateAsync(parseInt(id));
                  toast({
                    title: "User deleted",
                    description: "The user has been successfully deleted"
                  });
                  navigate('/users');
                } catch (err) {
                  console.error('Error deleting user:', err);
                  toast({
                    title: "Error",
                    description: "Could not delete user. Please try again.",
                    variant: "destructive"
                  });
                }
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserDetailPage;
