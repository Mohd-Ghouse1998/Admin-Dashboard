import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { walletService } from '@/modules/payments/services/walletService';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface RefundDialogProps {
  userId: number;
  username: string;
  currentBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RefundDialog: React.FC<RefundDialogProps> = ({ 
  userId, 
  username, 
  currentBalance,
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { toast } = useToast();
  const [orderId, setOrderId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleProcessRefund = async () => {
    if (!orderId) {
      toast({
        title: 'Error',
        description: 'Please enter a valid Razorpay Order ID',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > currentBalance) {
      toast({
        title: 'Error',
        description: `Please enter a valid amount between 0 and ${formatCurrency(currentBalance)}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await walletService.processRefund(orderId, parseFloat(amount), reason);
      
      toast({
        title: 'Success',
        description: `${formatCurrency(parseFloat(amount))} has been refunded from ${username}'s wallet`,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: 'Error',
        description: 'Failed to process refund',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOrderId('');
    setAmount('');
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Issue Refund</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="orderId" className="text-right">
              Razorpay Order ID*
            </Label>
            <Input
              id="orderId"
              className="col-span-3"
              placeholder="order_abc123456"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 gap-1">
            <div></div>
            <div className="col-span-3 text-xs text-muted-foreground">
              Enter the original order ID to refund
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Refund Amount*
            </Label>
            <div className="relative col-span-3">
              <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
              <Input
                id="amount"
                type="number"
                placeholder="50.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                min="0"
                max={currentBalance}
                step="0.01"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1">
            <div></div>
            <div className="col-span-3 text-xs text-muted-foreground">
              Maximum refund amount: {formatCurrency(currentBalance)}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason
            </Label>
            <Textarea
              id="reason"
              className="col-span-3"
              placeholder="Customer requested refund"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleProcessRefund} 
            disabled={
              isLoading || 
              !orderId || 
              !amount || 
              parseFloat(amount) <= 0 || 
              parseFloat(amount) > currentBalance
            }
          >
            Process Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RefundDialog;
