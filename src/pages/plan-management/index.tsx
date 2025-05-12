import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { userApi } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(date);
};

const PlanManagement = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [plans, setPlans] = useState([]);
  const [planUsers, setPlanUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;
      
      try {
        setLoading(true);
        const [plansData, planUsersData] = await Promise.all([
          userApi.getPlans(accessToken),
          userApi.getPlanUsers(accessToken)
        ]);
        
        setPlans(plansData.results || plansData || []);
        setPlanUsers(planUsersData.results || planUsersData || []);
      } catch (err) {
        console.error("Error fetching plan data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  // Filter plans based on search term
  const filteredPlans = plans.filter(
    (plan) =>
      plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter plan users based on search term
  const filteredPlanUsers = planUsers.filter(
    (planUser) =>
      planUser.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      planUser.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      planUser.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Plan Management</h1>
        <Button onClick={() => navigate("/plans/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add New Plan
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">
          Error loading plan data: {error}
        </div>
      ) : (
        <Tabs defaultValue="plans" className="mb-6">
          <TabsList>
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="subscribers">Plan Subscribers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>
                  Manage your subscription plans and view subscriber counts.
                </CardDescription>
                <div className="flex items-center mt-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search plans..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>A list of subscription plans.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Subscribers</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No plans found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPlans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{plan.name}</div>
                              <div className="text-sm text-gray-500">
                                {plan.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {plan.price} {plan.currency}
                          </TableCell>
                          <TableCell>{plan.duration_days} days</TableCell>
                          <TableCell>
                            {planUsers.filter(pu => pu.plan?.id === plan.id).length}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={plan.is_active ? "default" : "secondary"}
                              className={plan.is_active ? "bg-green-500" : ""}
                            >
                              {plan.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => navigate(`/plans/${plan.id}`)}
                                >
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Edit plan</DropdownMenuItem>
                                <DropdownMenuItem
                                  className={plan.is_active ? "text-red-600" : "text-green-600"}
                                >
                                  {plan.is_active ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscribers">
            <Card>
              <CardHeader>
                <CardTitle>Plan Subscribers</CardTitle>
                <CardDescription>
                  Users who have subscribed to plans
                </CardDescription>
                <div className="flex items-center mt-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search subscribers..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>A list of plan subscribers.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlanUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No subscribers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPlanUsers.map((planUser) => (
                        <TableRow key={planUser.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{planUser.user?.username}</div>
                              <div className="text-sm text-gray-500">
                                {planUser.user?.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{planUser.plan?.name}</TableCell>
                          <TableCell>{formatDate(planUser.start_date)}</TableCell>
                          <TableCell>{formatDate(planUser.end_date)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={planUser.is_active ? "default" : "secondary"}
                              className={planUser.is_active ? "bg-green-500" : ""}
                            >
                              {planUser.is_active ? "Active" : "Expired"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>View details</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Cancel subscription</DropdownMenuItem>
                                <DropdownMenuItem>Extend subscription</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PlanManagement;
