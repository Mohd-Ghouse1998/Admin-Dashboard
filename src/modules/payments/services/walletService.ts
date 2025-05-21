import { 
  Wallet, 
  WalletUserTransaction,
  WalletStats,
  PaginatedResponse,
  getWallets,
  getWalletsByUser,
  getLatestTransactionsByUser,
  getWalletStats,
  createWalletTransaction,
  processRefund,
  getWallet,
  createWalletDepositOrder,
  handlePaymentSuccess
} from '@/services/api/walletsApi';

// Define reason options
export const REASON_OPTIONS = [
  { value: 'Customer Deposit', label: 'Customer Deposit' },
  { value: 'Employee Deposit', label: 'Employee Deposit' },
  { value: 'Bonus', label: 'Bonus' },
  { value: 'Gift Deposit', label: 'Gift Deposit' },
  { value: 'Refund', label: 'Refund' },
  { value: 'Promo Credit', label: 'Promo Credit' },
  { value: 'Adjustment', label: 'Adjustment' },
  { value: 'Payment', label: 'Payment' },
  { value: 'Service Fee', label: 'Service Fee' },
  { value: 'Other', label: 'Other' }
];

/**
 * Service for wallet operations
 */
export const walletService = {
  /**
   * Get latest wallet transaction for each user
   */
  getLatestTransactionsByUser: async (): Promise<WalletUserTransaction[]> => {
    try {
      const response = await getLatestTransactionsByUser();
      // Log the data to see the actual response format
      console.log('API wallet response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest wallet transactions:', error);
      throw error;
    }
  },

  /**
   * Get all wallet transactions with optional filtering and pagination
   */
  getWallets: async (params?: Record<string, any>): Promise<PaginatedResponse<Wallet>> => {
    try {
      const response = await getWallets(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error;
    }
  },

  /**
   * Get wallet transactions for a specific user
   */
  getWalletsByUser: async (userId: number, params?: Record<string, any>): Promise<PaginatedResponse<Wallet>> => {
    try {
      const response = await getWalletsByUser(userId, params);
      return response.data;
    } catch (error) {
      console.error(`Error fetching wallets for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get wallet statistics for a user
   */
  getWalletStats: async (userId: number): Promise<WalletStats> => {
    try {
      const response = await getWalletStats(userId);
      return response.data;
    } catch (error) {
      console.error(`Error fetching wallet stats for user ${userId}:`, error);
      // If stats endpoint is not implemented, calculate from transactions
      try {
        const wallets = await walletService.getWalletsByUser(userId);
        const transactions = wallets.results;
        
        // Get the latest transaction to determine current balance
        const latestTransaction = transactions[0];
        const currentBalance = latestTransaction ? latestTransaction.end_balance : 0;
        
        // Calculate total deposits and withdrawals
        let totalDeposits = 0;
        let totalWithdrawals = 0;
        
        transactions.forEach(transaction => {
          if (transaction.amount > 0) {
            totalDeposits += transaction.amount;
          } else {
            totalWithdrawals += Math.abs(transaction.amount);
          }
        });
        
        return {
          current_balance: currentBalance,
          total_deposits: totalDeposits,
          total_withdrawals: totalWithdrawals
        };
      } catch (fallbackError) {
        console.error('Fallback calculation failed:', fallbackError);
        throw error;
      }
    }
  },

  /**
   * Add funds to a user's wallet
   */
  addFunds: async (userId: number, amount: number, reason: string): Promise<Wallet> => {
    try {
      const response = await createWalletTransaction({
        user: userId,
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error adding funds to wallet:', error);
      throw error;
    }
  },

  /**
   * Process a refund
   */
  processRefund: async (orderId: string, amount: number, reason?: string): Promise<any> => {
    try {
      const response = await processRefund({
        razorpay_order_id: orderId,
        refund_amount: amount,
        reason,
        refund_type: 'wallet'
      });
      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  },

  /**
   * Handle Razorpay payment flow
   */
  handleRazorpayPayment: async (amount: number): Promise<any> => {
    // 1. Create order
    const orderResponse = await createWalletDepositOrder(amount);
    const orderData = orderResponse.data;
    
    // 2. Initialize Razorpay checkout
    return new Promise((resolve, reject) => {
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_key', // Replace with your key
        amount: amount * 100, // Razorpay accepts amount in paise
        currency: 'INR',
        name: 'Joulepoint Platform',
        description: 'Wallet Top-up',
        order_id: orderData.order_id,
        handler: async function(response: any) {
          try {
            // 3. Handle payment success
            const successResponse = await handlePaymentSuccess({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
            resolve(successResponse.data);
          } catch (error) {
            reject(error);
          }
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
          contact: ''
        },
        theme: {
          color: '#3399cc'
        }
      };
      
      // @ts-ignore - Razorpay will be loaded externally
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  }
};

export default walletService;
