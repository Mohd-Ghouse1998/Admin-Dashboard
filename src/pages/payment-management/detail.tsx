
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, RefreshCcw, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { userApi } from "@/services/api";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

const PaymentDetail = () => {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState("payment");
  const [payment, setPayment] = useState(null);
  const [sessionBillings, setSessionBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionBillingsLoading, setSessionBillingsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  
  const fetchPaymentById = async () => {
    if (!accessToken || !id) return;
    
    try {
      setLoading(true);
      // Try to get the specific payment by ID first
      try {
        const paymentData = await userApi.getPaymentById(accessToken, id);
        if (paymentData) {
          setPayment(paymentData);
        }
      } catch (err) {
        // If direct fetch fails, try to find it in the list
        const paymentsData = await userApi.getPayments(accessToken);
        const payment = paymentsData.results?.find(p => p.id === id) || null;
        
        if (payment) {
          setPayment(payment);
        }
      }
    } catch (err) {
      console.error("Error fetching payment details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSessionBillings = async (page = 1) => {
    if (!accessToken) return;
    
    try {
      setSessionBillingsLoading(true);
      let sessionBillingsData;
      
      if (page === 1) {
        sessionBillingsData = await userApi.getSessionBillings(accessToken);
      } else {
        sessionBillingsData = await userApi.getSessionBillings(accessToken, page);
      }
      
      setSessionBillings(sessionBillingsData.results || []);
      setTotalPages(Math.ceil(sessionBillingsData.count / 10)); // Assuming 10 items per page
      setNextPageUrl(sessionBillingsData.next);
      setPrevPageUrl(sessionBillingsData.previous);
      
    } catch (err) {
      console.error("Error fetching session billings:", err);
      setError(err.message);
    } finally {
      setSessionBillingsLoading(false);
    }
  };
  
  // Handle page change
  const handlePageChange = async (newPage) => {
    setCurrentPage(newPage);
    await fetchSessionBillings(newPage);
  };
  
  // Handle next/previous page navigation using URLs
  const handleNextPage = async () => {
    if (!nextPageUrl) return;
    
    try {
      setSessionBillingsLoading(true);
      const data = await userApi.getSessionBillingByUrl(accessToken, nextPageUrl);
      setSessionBillings(data.results || []);
      setNextPageUrl(data.next);
      setPrevPageUrl(data.previous);
      setCurrentPage(currentPage + 1);
    } catch (err) {
      console.error("Error fetching next page:", err);
      setError(err.message);
    } finally {
      setSessionBillingsLoading(false);
    }
  };
  
  const handlePrevPage = async () => {
    if (!prevPageUrl) return;
    
    try {
      setSessionBillingsLoading(true);
      const data = await userApi.getSessionBillingByUrl(accessToken, prevPageUrl);
      setSessionBillings(data.results || []);
      setNextPageUrl(data.next);
      setPrevPageUrl(data.previous);
      setCurrentPage(currentPage - 1);
    } catch (err) {
      console.error("Error fetching previous page:", err);
      setError(err.message);
    } finally {
      setSessionBillingsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPaymentById();
    fetchSessionBillings();
  }, [accessToken, id]);
  
  // When tab changes, reset pagination
  useEffect(() => {
    if (activeTab === "session-billings") {
      fetchSessionBillings(1);
      setCurrentPage(1);
    }
  }, [activeTab]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16 text-red-500">
          Error loading payment data: {error}
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          Payment not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-4" asChild>
          <Link to="/payment-management">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payments
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Payment Details</h1>
        <div className="ml-auto">
          <Button variant="outline" className="mr-2">
            <Download className="mr-2 h-4 w-4" /> Download Receipt
          </Button>
          <Button variant="outline" className="bg-[#4284C0] text-white hover:bg-[#3A75A8]">
            <RefreshCcw className="mr-2 h-4 w-4" /> Retry Payment
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="payment" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="payment">Payment Details</TabsTrigger>
          <TabsTrigger value="session-billings">Session Billings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>Details about this payment transaction</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                      <div>
                        <div className="text-sm text-muted-foreground">Amount</div>
                        <div className="text-2xl font-bold">{payment.currency || "USD"} {parseFloat(payment.total || 0).toFixed(2)}</div>
                      </div>
                      <Badge className={payment.status === 'completed' 
                        ? 'bg-[#6BA033] text-lg py-1 px-3' 
                        : payment.status === 'waiting' || payment.status === 'pending'
                        ? 'bg-yellow-500 text-lg py-1 px-3'
                        : 'bg-red-500 text-lg py-1 px-3'}>
                        {payment.status || "unknown"}
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Payment Method</div>
                        <div className="font-medium">{payment.variant || "Not specified"}</div>
                      </div>
                      
                      {payment.billing_email && (
                        <div>
                          <div className="text-sm text-muted-foreground">Billing Email</div>
                          <div className="font-medium">{payment.billing_email}</div>
                        </div>
                      )}
                      
                      <div>
                        <div className="text-sm text-muted-foreground">Transaction ID</div>
                        <div className="font-medium font-mono">{payment.transaction_id || "Not available"}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground">Date</div>
                        <div className="font-medium">{formatDate(payment.created)}</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Payment Details</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {payment.description && (
                          <div>
                            <div className="text-sm font-medium">Description</div>
                            <div>{payment.description}</div>
                          </div>
                        )}
                        
                        <div>
                          <div className="text-sm font-medium">Payment ID</div>
                          <div className="font-mono">{payment.id}</div>
                        </div>
                        
                        {payment.order && (
                          <div>
                            <div className="text-sm font-medium">Order ID</div>
                            <div className="font-mono">{payment.order}</div>
                          </div>
                        )}
                        
                        {payment.captured_amount && (
                          <div>
                            <div className="text-sm font-medium">Captured Amount</div>
                            <div>{payment.captured_amount}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
          
              <Card>
                <CardHeader>
                  <CardTitle>Payment Timeline</CardTitle>
                  <CardDescription>History of this payment transaction</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-3 h-3 rounded-full bg-[#6BA033]"></div>
                        <div className="w-px h-16 bg-gray-200"></div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(payment.modified)}
                        </div>
                        <div className="font-medium">Payment {payment.status}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {payment.message || "No additional information available."}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div className="w-px h-16 bg-gray-200"></div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(payment.created)}
                        </div>
                        <div className="font-medium">Payment initiated</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Payment was initiated for order {payment.order}.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payment.billing_first_name && payment.billing_last_name && (
                      <div>
                        <div className="text-sm text-muted-foreground">Name</div>
                        <div className="font-medium">{payment.billing_first_name} {payment.billing_last_name}</div>
                      </div>
                    )}
                    
                    {payment.billing_email && (
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium">{payment.billing_email}</div>
                      </div>
                    )}
                    
                    {payment.billing_phone && (
                      <div>
                        <div className="text-sm text-muted-foreground">Phone</div>
                        <div className="font-medium">{payment.billing_phone}</div>
                      </div>
                    )}
                    
                    {payment.billing_address_1 && (
                      <div>
                        <div className="text-sm text-muted-foreground">Address</div>
                        <div className="font-medium">
                          {payment.billing_address_1}
                          {payment.billing_address_2 && <>, {payment.billing_address_2}</>}
                          {payment.billing_city && <>, {payment.billing_city}</>}
                          {payment.billing_postcode && <>, {payment.billing_postcode}</>}
                          {payment.billing_country_code && <>, {payment.billing_country_code}</>}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Payment Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full">
                      Download Receipt
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      Send Receipt to Customer
                    </Button>
                    
                    <Button variant="outline" className="w-full text-red-500 hover:text-red-700 hover:bg-red-50">
                      Request Refund
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="session-billings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Billings</CardTitle>
              <CardDescription>Billing details for charging sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                {sessionBillingsLoading ? (
                  <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Amount Added</TableHead>
                        <TableHead>Amount Consumed</TableHead>
                        <TableHead>kWh Added</TableHead>
                        <TableHead>kWh Consumed</TableHead>
                        <TableHead>Session ID</TableHead>
                        <TableHead>CDR Sent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessionBillings.length > 0 ? (
                        sessionBillings.map((billing) => (
                          <TableRow key={billing.id}>
                            <TableCell className="font-medium">{billing.id.substring(0, 8)}...</TableCell>
                            <TableCell>{billing.amount_added}</TableCell>
                            <TableCell>{billing.amount_consumed || 'N/A'}</TableCell>
                            <TableCell>{billing.kwh_added}</TableCell>
                            <TableCell>{billing.kwh_consumed || 'N/A'}</TableCell>
                            <TableCell>{billing.session}</TableCell>
                            <TableCell>
                              <Badge variant={billing.cdr_sent ? "default" : "secondary"}>
                                {billing.cdr_sent ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                            No session billings found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
              
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      {prevPageUrl ? (
                        <PaginationPrevious onClick={handlePrevPage} />
                      ) : (
                        <span className="flex h-9 items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground">
                          <ChevronLeft className="h-4 w-4" />
                          <span>Previous</span>
                        </span>
                      )}
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink 
                            isActive={pageNumber === currentPage}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      {nextPageUrl ? (
                        <PaginationNext onClick={handleNextPage} />
                      ) : (
                        <span className="flex h-9 items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground">
                          <span>Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      )}
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentDetail;
