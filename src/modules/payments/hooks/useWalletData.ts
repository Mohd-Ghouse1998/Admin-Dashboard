
import { useState, useEffect } from 'react';
import { userApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface WalletStats {
  totalActiveWallets: number;
  totalBalance: number;
  averageBalance: number;
}

export const useWalletData = (accessToken: string) => {
  const [wallets, setWallets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState<WalletStats>({
    totalActiveWallets: 0,
    totalBalance: 0,
    averageBalance: 0
  });
  const { toast } = useToast();

  const calculateStats = (walletData: any[]) => {
    const activeWallets = walletData.filter(w => w && (w.status === 'active' || !w.status)).length;
    const balance = walletData.reduce((sum, wallet) => {
      if (!wallet) return sum;
      return sum + (parseFloat(wallet.end_balance?.toString() || '0') || 0);
    }, 0);
    const average = walletData.length > 0 ? balance / walletData.length : 0;
    
    setStats({
      totalActiveWallets: activeWallets,
      totalBalance: balance,
      averageBalance: average
    });
  };

  const fetchWallets = async (page = 1) => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const walletsData = await userApi.getWallets(accessToken, page);
      
      if (Array.isArray(walletsData)) {
        setWallets(walletsData);
        setTotalItems(walletsData.length);
        setTotalPages(Math.ceil(walletsData.length / 10));
      } else if (walletsData && walletsData.results) {
        setWallets(walletsData.results);
        if (walletsData.count) {
          setTotalItems(walletsData.count);
          setTotalPages(Math.ceil(walletsData.count / (walletsData.page_size || 10)));
        }
      }
      
      setCurrentPage(page);
      calculateStats(walletsData?.results || walletsData || []);
    } catch (err: any) {
      console.error("Error fetching wallet data:", err);
      toast({
        title: "Error fetching wallet data",
        description: err.message || "Could not load wallet information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!accessToken) return;
    
    try {
      setOrderLoading(true);
      const ordersData = await userApi.getOrders(accessToken);
      
      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
      } else if (ordersData && ordersData.results) {
        setOrders(ordersData.results);
      }
    } catch (err: any) {
      console.error("Error fetching orders data:", err);
      toast({
        title: "Error fetching orders data",
        description: err.message || "Could not load order information",
        variant: "destructive"
      });
    } finally {
      setOrderLoading(false);
    }
  };

  return {
    wallets,
    orders,
    loading,
    orderLoading,
    currentPage,
    totalPages,
    totalItems,
    stats,
    fetchWallets,
    fetchOrders
  };
};
