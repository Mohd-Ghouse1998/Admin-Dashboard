import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  Mail, 
  Printer, 
  RefreshCw, 
  User,
  XCircle
} from 'lucide-react';

// Mock data for a transaction
const getMockTransaction = (id: string) => {
  // Find the transaction based on ID or use a default
  const txNumber = id.split('-')[1] || '001';
  
  const transactionData = {
    id,
    userId: `10${txNumber}`,
    username: txNumber === '001' ? 'johndoe' : 
              txNumber === '002' ? 'janedoe' : 
              txNumber === '003' ? 'bobsmith' : 'alicegreen',
    userEmail: txNumber === '001' ? 'john.doe@example.com' : 
               txNumber === '002' ? 'jane.doe@example.com' : 
               txNumber === '003' ? 'bob.smith@example.com' : 'alice.green@example.com',
    userFullName: txNumber === '001' ? 'John Doe' : 
                  txNumber === '002' ? 'Jane Doe' : 
                  txNumber === '003' ? 'Bob Smith' : 'Alice Green',
    amount: txNumber === '001' ? 49.99 : 
            txNumber === '002' ? 150.00 : 
            txNumber === '003' ? 25.50 : 75.25,
    currency: 'USD',
    status: txNumber === '001' ? 'completed' : 
            txNumber === '003' ? 'pending' : 
            txNumber === '004' ? 'failed' : 'completed',
    type: txNumber === '002' ? 'topup' : 
          txNumber === '006' ? 'refund' : 'payment',
    paymentMethod: txNumber === '002' ? 'bank_transfer' : 
                  txNumber === '003' || txNumber === '005' ? 'wallet' : 'credit_card',
    cardType: txNumber === '001' ? 'Visa' : 
              txNumber === '004' ? 'Mastercard' : 
              txNumber === '007' ? 'Amex' : 'Visa',
    cardLast4: txNumber === '001' ? '4242' : 
               txNumber === '004' ? '5678' : 
               txNumber === '006' ? '1234' : 
               txNumber === '007' ? '7890' : '4444',
    reference: txNumber === '002' || txNumber === '007' ? 'Wallet topup' : 
               `Session #${4580 + parseInt(txNumber)}`,
    description: txNumber === '002' || txNumber === '007' ? 'Wallet balance top-up' : 
                txNumber === '006' ? 'Refund for incomplete session' : 'Charging session payment',
    createdAt: `2025-05-0${Math.min(parseInt(txNumber), 3)}T${10 + parseInt(txNumber)}:${10 + parseInt(txNumber) * 5}:00Z`,
    processingTime: `${1 + (parseInt(txNumber) % 3)}s`,
    gatewayResponse: txNumber === '004' ? 'Declined: Insufficient funds' : 'Approved',
    gatewayReference: `gw-${Date.now().toString().substring(7)}${txNumber}`,
    feeAmount: parseFloat((parseFloat(txNumber) * 0.15).toFixed(2)),
    taxAmount: parseFloat((parseFloat(txNumber) * 0.08).toFixed(2)),
    netAmount: txNumber === '002' || txNumber === '007' ? 150.00 - parseFloat((parseFloat(txNumber) * 0.23).toFixed(2)) : 
               txNumber === '001' ? 49.99 - parseFloat((parseFloat(txNumber) * 0.23).toFixed(2)) : 
               txNumber === '003' ? 25.50 - parseFloat((parseFloat(txNumber) * 0.23).toFixed(2)) : 
               75.25 - parseFloat((parseFloat(txNumber) * 0.23).toFixed(2)),
    ipAddress: `192.168.1.${100 + parseInt(txNumber)}`,
    userDevice: `${txNumber === '001' || txNumber === '004' ? 'Mobile' : 'Desktop'} - ${txNumber === '001' || txNumber === '004' ? 'iOS' : 'Chrome'}`
  };
  
  return transactionData;
};

const TransactionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const transaction = getMockTransaction(id || 'tx-001');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleBack = () => {
    navigate('/payments/transactions');
  };

  const handleViewUser = () => {
    navigate(`/users/${transaction.userId}`);
  };

  return (
    <PageLayout
      title={`Transaction: ${transaction.id}`}
      description="View transaction details and history"
      breadcrumbs={[
        { label: 'Payment & Billing', url: '/payments' },
        { label: 'Transactions', url: '/payments/transactions' },
        { label: transaction.id, url: `/payments/transactions/${id}` }
      ]}
      actions={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          {transaction.status === 'pending' && (
            <Button variant="destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          {transaction.status === 'failed' && transaction.type !== 'refund' && (
            <Button>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Transaction Information</CardTitle>
                  <CardDescription>Complete transaction details</CardDescription>
                </div>
                <Badge 
                  variant={
                    transaction.status === 'completed' ? 'success' : 
                    transaction.status === 'pending' ? 'secondary' : 
                    'destructive'
                  }
                  className="ml-2 text-sm"
                >
                  {transaction.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Transaction ID</TableCell>
                    <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Type</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          transaction.type === 'payment' ? 'default' : 
                          transaction.type === 'refund' ? 'secondary' : 
                          'success'
                        }
                      >
                        {transaction.type === 'payment' ? 'Payment' : 
                         transaction.type === 'refund' ? 'Refund' : 
                         'Top-up'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Amount</TableCell>
                    <TableCell className="font-medium text-lg">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Fee</TableCell>
                    <TableCell>{formatCurrency(transaction.feeAmount)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Tax</TableCell>
                    <TableCell>{formatCurrency(transaction.taxAmount)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Net Amount</TableCell>
                    <TableCell>{formatCurrency(transaction.netAmount)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Date & Time</TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Reference</TableCell>
                    <TableCell>{transaction.reference}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Description</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Payment method and processing information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Payment Method</TableCell>
                    <TableCell>
                      {transaction.paymentMethod === 'credit_card' ? 
                       `${transaction.cardType} ****${transaction.cardLast4}` : 
                       transaction.paymentMethod === 'bank_transfer' ? 
                       'Bank Transfer' : 'Wallet'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Processing Time</TableCell>
                    <TableCell>{transaction.processingTime}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Gateway Response</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          transaction.gatewayResponse === 'Approved' ? 'success' : 'destructive'
                        }
                      >
                        {transaction.gatewayResponse}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Gateway Reference</TableCell>
                    <TableCell className="font-mono text-sm">{transaction.gatewayReference}</TableCell>
                  </TableRow>
                  {transaction.type === 'payment' && (
                    <TableRow>
                      <TableCell className="font-medium">Service Reference</TableCell>
                      <TableCell className="flex items-center">
                        {transaction.reference}
                        <Button variant="ghost" size="sm" className="ml-2" onClick={() => navigate(`/chargers/sessions/${transaction.reference.split('#')[1]}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Security Information</CardTitle>
              <CardDescription>Transaction security and verification details</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">IP Address</TableCell>
                    <TableCell className="font-mono">{transaction.ipAddress}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Device</TableCell>
                    <TableCell>{transaction.userDevice}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">3D Secure</TableCell>
                    <TableCell>
                      {transaction.paymentMethod === 'credit_card' ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">N/A</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Fraud Check</TableCell>
                    <TableCell>
                      <Badge variant="success">Passed</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Details about the transaction customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{transaction.userFullName}</p>
                  <p className="text-sm text-gray-500">{transaction.username}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="flex items-center">
                  {transaction.userEmail}
                  <Button variant="ghost" size="sm" className="ml-1 h-6 w-6 p-0">
                    <Mail className="h-3 w-3" />
                  </Button>
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">User ID</p>
                <p className="font-mono text-sm">{transaction.userId}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Account Status</p>
                <Badge>Active</Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <Button onClick={handleViewUser} className="w-full">
                <User className="mr-2 h-4 w-4" />
                View Customer Profile
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Related Transactions</CardTitle>
              <CardDescription>Other transactions from this user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="flex flex-col">
                    <span className="font-medium">tx-00{parseInt(transaction.id.split('-')[1]) + 1}</span>
                    <span className="text-xs text-gray-500">
                      {formatDate('2025-05-02T14:30:00Z').split(',')[0]}
                    </span>
                  </div>
                  <span className="font-medium">{formatCurrency(35.50)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="flex flex-col">
                    <span className="font-medium">tx-00{parseInt(transaction.id.split('-')[1]) + 2}</span>
                    <span className="text-xs text-gray-500">
                      {formatDate('2025-04-28T10:15:00Z').split(',')[0]}
                    </span>
                  </div>
                  <span className="font-medium">{formatCurrency(42.75)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="flex flex-col">
                    <span className="font-medium">tx-00{parseInt(transaction.id.split('-')[1]) + 3}</span>
                    <span className="text-xs text-gray-500">
                      {formatDate('2025-04-15T16:45:00Z').split(',')[0]}
                    </span>
                  </div>
                  <span className="font-medium">{formatCurrency(19.99)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <Button variant="outline" className="w-full" onClick={() => navigate('/payments/transactions')}>
                View All User Transactions
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {transaction.status === 'completed' && transaction.type === 'payment' && (
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Issue Refund
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Email Receipt
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Eye className="mr-2 h-4 w-4" />
                View Receipt
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default TransactionDetailPage;
