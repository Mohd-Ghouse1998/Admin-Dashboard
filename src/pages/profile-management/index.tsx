import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Loader2, Save, Eye, Edit } from "lucide-react";
import { userApi } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ProfileManagement = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!accessToken) return;
      
      try {
        setLoading(true);
        // Only fetch profiles first to verify the API is working
        const profilesData = await userApi.getProfiles(accessToken);
        setProfiles(profilesData.results || profilesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching profiles:", err);
        setError(err.message || "Failed to load profiles");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfiles();
  }, [accessToken]);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!accessToken) return;
      
      try {
        const userProfileData = await userApi.getUserProfile(accessToken);
        setSelectedProfile(userProfileData);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err.message || "Failed to load user profile");
      }
    };
    
    fetchUserProfile();
  }, [accessToken]);
  
  useEffect(() => {
    console.log("Current editingProfile:", editingProfile);
  }, [editingProfile]);
  
  const handleInputChange = (field, value) => {
    setEditingProfile(prev => {
      if (!prev) return prev; // Guard against null/undefined
      
      return {
        ...prev,
        [field]: value
      };
    });
  };
  
  const handleSaveChanges = async () => {
    if (!editingProfile || !accessToken) {
      console.error("Cannot save: editingProfile or accessToken is missing");
      toast({
        title: "Error",
        description: "Unable to save changes. Missing required data.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Before save - editingProfile:", editingProfile);
    
    try {
      setSaving(true);
      
      // Create a clean copy of the profile with only the fields we want to update
      const profileToUpdate = {
        phone_number: editingProfile.phone_number || "",
        city: editingProfile.city || "",
        state: editingProfile.state || "",
        pin: editingProfile.pin || "",
        address: editingProfile.address || "",
        ocpi_party_id: editingProfile.ocpi_party_id || "",
        ocpi_role: editingProfile.ocpi_role || "",
        ocpi_token: editingProfile.ocpi_token || ""
      };
      
      console.log("Updating profile with data:", profileToUpdate);
      
      // For now, just update the local state
      const updatedProfiles = [...profiles];
      if (typeof editingProfile.index === 'number' && editingProfile.index >= 0 && editingProfile.index < updatedProfiles.length) {
        updatedProfiles[editingProfile.index] = {
          ...updatedProfiles[editingProfile.index],
          ...profileToUpdate
        };
        setProfiles(updatedProfiles);
        
        toast({
          title: "Profile Updated",
          description: "Profile has been updated successfully.",
          variant: "default",
        });
      } else {
        throw new Error("Invalid profile index");
      }
      
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleViewProfile = (profile, index) => {
    setSelectedProfile({...profile, index});
    setViewDialogOpen(true);
  };
  
  const handleEditProfile = (profile, index) => {
    setEditingProfile({...profile, index});
    setEditDialogOpen(true);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-16 text-red-500">
        Error loading profile data: {error}
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>User Profiles</CardTitle>
          <CardDescription>View and manage all user profiles in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>OCPI Info</TableHead>
                  <TableHead>Verification Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No profiles found
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((profile, index) => (
                    <TableRow key={`profile-${index}`}>
                      <TableCell className="font-medium">{profile.phone_number || "—"}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{profile.city || "—"}</div>
                          <div className="text-sm text-muted-foreground">{profile.state || "—"}{profile.pin ? `, ${profile.pin}` : ""}</div>
                          {profile.address && <div className="text-sm mt-1">{profile.address}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div><span className="font-medium">Role:</span> {profile.ocpi_role || "—"}</div>
                          <div><span className="font-medium">Party ID:</span> {profile.ocpi_party_id || "—"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={profile.is_phone_verified ? "default" : "outline"}>
                            {profile.is_phone_verified ? "Phone Verified" : "Phone Unverified"}
                          </Badge>
                          <Badge variant={profile.is_email_verified ? "default" : "outline"}>
                            {profile.is_email_verified ? "Email Verified" : "Email Unverified"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewProfile(profile, index)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditProfile(profile, index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Profile Details</DialogTitle>
            <DialogDescription>
              Detailed profile information
            </DialogDescription>
          </DialogHeader>
          
          {selectedProfile && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium">Phone:</div>
                <div>{selectedProfile.phone_number || "—"}</div>
              </div>
              
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium">City:</div>
                <div>{selectedProfile.city || "—"}</div>
              </div>
              
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium">State:</div>
                <div>{selectedProfile.state || "—"}</div>
              </div>
              
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium">PIN:</div>
                <div>{selectedProfile.pin || "—"}</div>
              </div>
              
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium">Address:</div>
                <div>{selectedProfile.address || "—"}</div>
              </div>
              
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium">OCPI Role:</div>
                <div>{selectedProfile.ocpi_role || "—"}</div>
              </div>
              
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium">Party ID:</div>
                <div>{selectedProfile.ocpi_party_id || "—"}</div>
              </div>
              
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium">Verification:</div>
                <div>
                  <div>Phone: {selectedProfile.is_phone_verified ? "Verified" : "Not Verified"}</div>
                  <div>Email: {selectedProfile.is_email_verified ? "Verified" : "Not Verified"}</div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button onClick={() => {
              setViewDialogOpen(false);
              handleEditProfile(selectedProfile, selectedProfile.index);
            }}>
              Edit Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to the profile information
            </DialogDescription>
          </DialogHeader>
          
          {editingProfile ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone_number" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone_number"
                  value={editingProfile.phone_number || ''}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city" className="text-right">
                  City
                </Label>
                <Input
                  id="city"
                  value={editingProfile.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="state" className="text-right">
                  State
                </Label>
                <Input
                  id="state"
                  value={editingProfile.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pin" className="text-right">
                  PIN
                </Label>
                <Input
                  id="pin"
                  value={editingProfile.pin || ''}
                  onChange={(e) => handleInputChange('pin', e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  value={editingProfile.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ocpi_role" className="text-right">
                  OCPI Role
                </Label>
                <Input
                  id="ocpi_role"
                  value={editingProfile.ocpi_role || ''}
                  onChange={(e) => handleInputChange('ocpi_role', e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ocpi_party_id" className="text-right">
                  Party ID
                </Label>
                <Input
                  id="ocpi_party_id"
                  value={editingProfile.ocpi_party_id || ''}
                  onChange={(e) => handleInputChange('ocpi_party_id', e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              No profile data available to edit
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveChanges} 
              disabled={saving || !editingProfile}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileManagement;
