import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileDown, Eye, CreditCard, ReceiptText, Loader2 } from "lucide-react";
import { userApi } from "@/services/api";

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const PaymentManagement = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [payments, setPayments] = useState([]);
  const [sessionBillings, setSessionBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;
      
      try {
        setLoading(true);
        const [paymentsData, sessionBillingsData] = await Promise.all([
          userApi.getPayments(accessToken),
          userApi.getSessionBillings(accessToken)
        ]);
        
        setPayments(paymentsData.results || paymentsData || []);
        setSessionBillings(sessionBillingsData.results || sessionBillingsData || []);
      } catch (err) {
        console.error("Error fetching payment data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [accessToken]);

  // Calculate total revenue
  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  // Count completed payments
  const completedPayments = payments.filter(p => p.status === 'completed').length;

  // Count failed payments
  const failedPayments = payments.filter(p => p.status === 'failed').length;

  // Filter payments based on search query and status
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || !statusFilter || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter session billings based on search query and status
  const filteredSessionBillings = sessionBillings.filter(billing => {
    const matchesSearch = 
      billing.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      billing.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || !statusFilter || billing.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Payment & Billing</h1>
        <Button className="bg-primary hover:bg-primary/90">
          <FileDown className="mr-2 h-4 w-4" /> Export Data
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">
                  ${totalRevenue.toFixed(2)}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">From all completed payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Payments</p>
                <h3 className="text-2xl font-bold mt-1">
                  {completedPayments}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <ReceiptText className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Successfully processed payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Payments</p>
                <h3 className="text-2xl font-bold mt-1">
                  {failedPayments}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Payments that failed to process</p>
          </CardContent>
        </Card>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">
          Error loading payment data: {error}
        </div>
      ) : (
        <Tabs defaultValue="payments" className="mb-6">
          <TabsList>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="billing">Session Billings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Records</CardTitle>
                <CardDescription>View and manage all payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search payments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <div className="w-[180px]">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Payment Status</SelectLabel>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No payments found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{payment.user?.name}</div>
                                <div className="text-sm text-muted-foreground">{payment.user?.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {payment.amount} {payment.currency}
                            </TableCell>
                            <TableCell>{payment.payment_method}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  payment.status === 'completed' ? 'default' :
                                  payment.status === 'pending' ? 'outline' : 'destructive'
                                }
                              >
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(payment.created_at)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/payments/${payment.id}`)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Session Billings</CardTitle>
                <CardDescription>View and manage session billing records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search billings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <div className="w-[180px]">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Billing Status</SelectLabel>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Session</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSessionBillings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No session billings found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSessionBillings.map((billing) => (
                          <TableRow key={billing.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{billing.user?.name}</div>
                                <div className="text-sm text-muted-foreground">{billing.user?.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>#{billing.session}</TableCell>
                            <TableCell>
                              {billing.total_amount} {billing.currency}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={billing.status === 'paid' ? 'default' : 'outline'}
                              >
                                {billing.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(billing.created_at)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PaymentManagement;
