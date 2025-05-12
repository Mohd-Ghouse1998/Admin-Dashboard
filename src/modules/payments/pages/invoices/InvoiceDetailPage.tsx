import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  FileText, 
  Edit, 
  Download, 
  Send, 
  Printer,
  AlertTriangle,
  Check,
  Clock
} from 'lucide-react';
import { 
  getInvoice, 
  Invoice, 
  InvoiceItem,
  markInvoiceAsSent,
  markInvoiceAsPaid,
  generateInvoicePdf,
  sendInvoiceEmail
} from '@/services/api/invoicesApi';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const InvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAsPaid, setIsMarkingAsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sendEmailOpen, setSendEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchInvoice = async () => {
      setIsLoading(true);
      try {
        const response = await getInvoice(parseInt(id));
        setInvoice(response.data);
        if (response.data.user_email) {
          setEmailTo(response.data.user_email);
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
        toast({
          title: 'Error',
          description: 'Failed to load invoice details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvoice();
  }, [id, toast]);

  const handleMarkAsSent = async () => {
    if (!id) return;
    
    try {
      await markInvoiceAsSent(parseInt(id));
      const response = await getInvoice(parseInt(id));
      setInvoice(response.data);
      toast({
        title: 'Success',
        description: 'Invoice has been marked as sent',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error marking invoice as sent:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark invoice as sent. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsPaid = async () => {
    if (!id || !paymentMethod || !paymentDate) return;
    
    setIsMarkingAsPaid(true);
    try {
      await markInvoiceAsPaid(parseInt(id), paymentDate, paymentMethod);
      const response = await getInvoice(parseInt(id));
      setInvoice(response.data);
      toast({
        title: 'Success',
        description: 'Invoice has been marked as paid',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark invoice as paid. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMarkingAsPaid(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!id) return;
    
    try {
      const response = await generateInvoicePdf(parseInt(id));
      
      // Create a blob from the PDF stream
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice?.invoice_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Invoice PDF downloaded',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download invoice PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSendEmail = async () => {
    if (!id || !emailTo) return;
    
    setIsSendingEmail(true);
    try {
      await sendInvoiceEmail(parseInt(id), emailTo);
      setSendEmailOpen(false);
      toast({
        title: 'Success',
        description: 'Invoice has been sent via email',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error sending invoice email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invoice email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  const handlePrintInvoice = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  const getStatusBadge = (status: string) => {
    let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' = 'default';
    let icon = null;
    
    switch (status) {
      case 'paid':
        variant = 'success';
        icon = <Check className="h-3 w-3 mr-1" />;
        break;
      case 'sent':
        variant = 'secondary';
        icon = <Send className="h-3 w-3 mr-1" />;
        break;
      case 'draft':
        variant = 'outline';
        icon = <FileText className="h-3 w-3 mr-1" />;
        break;
      case 'overdue':
        variant = 'destructive';
        icon = <AlertTriangle className="h-3 w-3 mr-1" />;
        break;
      case 'cancelled':
        variant = 'destructive';
        break;
      default:
        variant = 'outline';
    }
    
    return (
      <Badge variant={variant} className="flex items-center">
        {icon}
        {status}
      </Badge>
    );
  };

  const getStatusActions = () => {
    if (!invoice) return null;
    
    switch (invoice.status) {
      case 'draft':
        return (
          <>
            <Button variant="outline" onClick={handleMarkAsSent}>
              <Send className="h-4 w-4 mr-2" />
              Mark as Sent
            </Button>
          </>
        );
      case 'sent':
        return (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mark Invoice as Paid</DialogTitle>
                  <DialogDescription>
                    Enter payment details to mark this invoice as paid.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="payment-date" className="text-right">
                      Payment Date
                    </Label>
                    <Input
                      id="payment-date"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="payment-method" className="text-right">
                      Payment Method
                    </Label>
                    <select
                      id="payment-method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="col-span-3 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="">Select payment method</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="upi">UPI</option>
                      <option value="net_banking">Net Banking</option>
                      <option value="wallet">Wallet</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    onClick={handleMarkAsPaid}
                    disabled={isMarkingAsPaid || !paymentMethod}
                  >
                    {isMarkingAsPaid ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        );
      case 'overdue':
        return (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mark Invoice as Paid</DialogTitle>
                  <DialogDescription>
                    Enter payment details to mark this invoice as paid.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="payment-date" className="text-right">
                      Payment Date
                    </Label>
                    <Input
                      id="payment-date"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="payment-method" className="text-right">
                      Payment Method
                    </Label>
                    <select
                      id="payment-method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="col-span-3 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="">Select payment method</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="upi">UPI</option>
                      <option value="net_banking">Net Banking</option>
                      <option value="wallet">Wallet</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    onClick={handleMarkAsPaid}
                    disabled={isMarkingAsPaid || !paymentMethod}
                  >
                    {isMarkingAsPaid ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <PageLayout
        title="Invoice Details"
        description="Loading invoice information"
        backButton
        backTo="/payment/invoices"
      >
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-48" />
              </div>
            </div>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (!invoice) {
    return (
      <PageLayout
        title="Invoice Not Found"
        description="The requested invoice could not be found"
        backButton
        backTo="/payment/invoices"
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
            <p className="text-gray-500 mb-6">The invoice you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/payment/invoices')}>Return to Invoices</Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Invoice #${invoice.invoice_number}`}
      description={`Invoice issued on ${formatDate(invoice.issue_date)}`}
      backButton
      backTo="/payment/invoices"
      actions={
        <div className="flex space-x-2">
          {getStatusActions()}
          
          <Button variant="outline" onClick={() => navigate(`/payment/invoices/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          
          <Dialog open={sendEmailOpen} onOpenChange={setSendEmailOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Invoice via Email</DialogTitle>
                <DialogDescription>
                  Send this invoice to the customer via email.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email-to" className="text-right">
                    Recipient Email
                  </Label>
                  <Input
                    id="email-to"
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className="col-span-3"
                    placeholder="customer@example.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleSendEmail}
                  disabled={isSendingEmail || !emailTo}
                >
                  {isSendingEmail ? 'Sending...' : 'Send'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={handlePrintInvoice}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      }
    >
      <div className="grid gap-6">
        {/* Invoice Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Invoice #{invoice.invoice_number}</CardTitle>
                <CardDescription>
                  Status: {getStatusBadge(invoice.status)}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatCurrency(invoice.total_amount)}</p>
                <p className="text-sm text-muted-foreground">
                  {invoice.status === 'paid' && invoice.payment_date
                    ? `Paid on ${formatDate(invoice.payment_date)}`
                    : invoice.status === 'overdue'
                    ? `Overdue since ${formatDate(invoice.due_date)}`
                    : `Due on ${formatDate(invoice.due_date)}`}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company and Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-1">From</h3>
                <p className="text-sm">Electric Flow</p>
                <p className="text-sm">123 Energy Street</p>
                <p className="text-sm">EV City, 12345</p>
                <p className="text-sm">billing@electricflow.com</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">To</h3>
                <p className="text-sm">{invoice.user_name}</p>
                <p className="text-sm whitespace-pre-line">{invoice.billing_address}</p>
                {invoice.user_email && <p className="text-sm">{invoice.user_email}</p>}
              </div>
            </CardContent>
          </Card>
          
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Invoice Number</span>
                <span className="text-sm font-medium">{invoice.invoice_number}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Issue Date</span>
                <span className="text-sm">{formatDate(invoice.issue_date)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Due Date</span>
                <span className="text-sm">{formatDate(invoice.due_date)}</span>
              </div>
              
              {invoice.payment_date && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Date</span>
                  <span className="text-sm">{formatDate(invoice.payment_date)}</span>
                </div>
              )}
              
              {invoice.order_id && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Related Order</span>
                  <span className="text-sm">
                    <Button 
                      variant="link" 
                      className="h-auto p-0"
                      onClick={() => navigate(`/payment/orders/${invoice.order_id}`)}
                    >
                      Order #{invoice.order_id}
                    </Button>
                  </span>
                </div>
              )}
              
              {invoice.payment_method && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Method</span>
                  <span className="text-sm capitalize">
                    {invoice.payment_method.replace('_', ' ')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item: InvoiceItem) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <Separator />
          <CardFooter className="flex justify-end pt-6">
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Discount</span>
                  <span className="text-green-600">-{formatCurrency(invoice.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default InvoiceDetailPage;
