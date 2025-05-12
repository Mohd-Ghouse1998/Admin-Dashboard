
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";

// Sample profile data
const profileData = {
  id: "1", 
  user: { 
    id: "1",
    name: "John Doe", 
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
  },
  address: "123 Main Street",
  city: "New York",
  state: "NY",
  country: "USA",
  zipCode: "10001",
  gender: "Male",
  birthDate: "1990-01-15",
  createdAt: "2023-01-10",
  updatedAt: "2023-04-22",
};

const ProfileDetail = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(profileData);
  
  // In a real application, you would fetch the profile data based on the ID
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-4" asChild>
          <a href="/profiles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profiles
          </a>
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Profile Details</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#4284C0] text-white text-2xl">
                  {profile.user.name.charAt(0).toUpperCase()}
                </div>
              </Avatar>
              <h2 className="text-xl font-semibold">{profile.user.name}</h2>
              <p className="text-muted-foreground">{profile.user.email}</p>
              
              <div className="w-full mt-6">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{profile.user.phone}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{profile.createdAt}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium">{profile.updatedAt}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Tabs defaultValue="personal">
            <TabsList>
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update user's personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={profile.user.name.split(' ')[0]} 
                          onChange={(e) => setProfile({
                            ...profile, 
                            user: {
                              ...profile.user,
                              name: e.target.value + ' ' + profile.user.name.split(' ')[1]
                            }
                          })} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={profile.user.name.split(' ')[1]} 
                          onChange={(e) => setProfile({
                            ...profile, 
                            user: {
                              ...profile.user,
                              name: profile.user.name.split(' ')[0] + ' ' + e.target.value
                            }
                          })} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={profile.user.email} 
                          onChange={(e) => setProfile({
                            ...profile, 
                            user: {
                              ...profile.user,
                              email: e.target.value
                            }
                          })} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={profile.user.phone} 
                          onChange={(e) => setProfile({
                            ...profile, 
                            user: {
                              ...profile.user,
                              phone: e.target.value
                            }
                          })} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select 
                          value={profile.gender}
                          onValueChange={(value) => setProfile({...profile, gender: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Birth Date</Label>
                        <Input 
                          id="birthDate" 
                          type="date" 
                          value={profile.birthDate} 
                          onChange={(e) => setProfile({...profile, birthDate: e.target.value})} 
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" className="bg-[#4284C0] hover:bg-[#3A75A8]">
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="address" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Address Information</CardTitle>
                  <CardDescription>Update user's address details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input 
                          id="address" 
                          value={profile.address} 
                          onChange={(e) => setProfile({...profile, address: e.target.value})} 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input 
                            id="city" 
                            value={profile.city} 
                            onChange={(e) => setProfile({...profile, city: e.target.value})} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State/Province</Label>
                          <Input 
                            id="state" 
                            value={profile.state} 
                            onChange={(e) => setProfile({...profile, state: e.target.value})} 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">Zip/Postal Code</Label>
                          <Input 
                            id="zipCode" 
                            value={profile.zipCode} 
                            onChange={(e) => setProfile({...profile, zipCode: e.target.value})} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Select 
                            value={profile.country}
                            onValueChange={(value) => setProfile({...profile, country: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USA">United States</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="UK">United Kingdom</SelectItem>
                              <SelectItem value="Australia">Australia</SelectItem>
                              <SelectItem value="Germany">Germany</SelectItem>
                              <SelectItem value="France">France</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" className="bg-[#4284C0] hover:bg-[#3A75A8]">
                        <Save className="mr-2 h-4 w-4" /> Save Address
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Preferences</CardTitle>
                  <CardDescription>Set user preferences and settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Placeholder for preferences - would be expanded in a real app */}
                    <p className="text-center text-muted-foreground py-8">
                      User preferences customization coming soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
