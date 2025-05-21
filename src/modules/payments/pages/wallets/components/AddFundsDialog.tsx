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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { walletService, REASON_OPTIONS } from '@/modules/payments/services/walletService';
import { useToast } from '@/hooks/use-toast';

interface AddFundsDialogProps {
  userId: number;
  username: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddFundsDialog: React.FC<AddFundsDialogProps> = ({ 
  userId, 
  username, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('Customer Deposit');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount greater than 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await walletService.addFunds(userId, parseFloat(amount), reason);
      
      toast({
        title: 'Success',
        description: `${amount} has been added to ${username}'s wallet`,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding funds:', error);
      toast({
        title: 'Error',
        description: 'Failed to add funds to wallet',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setReason('Customer Deposit');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Funds to Wallet</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount*
            </Label>
            <div className="relative col-span-3">
              <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
              <Input
                id="amount"
                type="number"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason*
            </Label>
            <Select 
              value={reason} 
              onValueChange={setReason}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {REASON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddFunds} 
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
          >
            Add Funds
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFundsDialog;
