// hooks/useOrders.js
import { useState, useEffect, useCallback } from 'react';
import axios from '@/api/axios';
import useReceiptPrinter from './useReceiptPrinter';
import { toast } from 'sonner';

const useOrders = (sessionId, isRegisterOpen, checkRegisterStatus) => {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAllOrders, setIsLoadingAllOrders] = useState(false);
  const [error, setError] = useState(null);
  const [dailyStats, setDailyStats] = useState({ 
    cashRecvd: 0,
    onlinePaymnt: 0,
    expectedCash: 0,
    expectedOnline: 0,
    totalSales: 0, 
    totalPendingPayment: 0, 
    orderCount: 0 
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(true);
  
  const { printReceipt, isPrinting } = useReceiptPrinter();

  // Clear state when register is closed
  useEffect(() => {
    if (!isRegisterOpen) {
      setOrders([]);
      setDailyStats({
        cashRecvd: 0,
        onlinePaymnt: 0, 
        expectedCash: 0,
        expectedOnline: 0,
        totalSales: 0, 
        totalPendingPayment: 0, 
        orderCount: 0 
      });
      setError(null);
    }
  }, [isRegisterOpen]);

  // Fetch orders when sessionId becomes available or changes
  useEffect(() => {
    if (sessionId && isRegisterOpen) {
      setOrders([]);
      setDailyStats({ 
        cashRecvd: 0,
        onlinePaymnt: 0,
        expectedCash: 0,
        expectedOnline: 0,
        totalSales: 0, 
        totalPendingPayment: 0, 
        orderCount: 0 
      });
      
      fetchOrders();
      fetchDailyStats();
    } else {
      setIsLoading(false);
      setOrders([]);
      setDailyStats({ 
        cashRecvd: 0,
        onlinePaymnt: 0,
        totalSales: 0, 
        totalPendingPayment: 0, 
        orderCount: 0 
      });
    }
  }, [sessionId, isRegisterOpen]);

  const fetchOrders = async () => {
    if (!sessionId || !isRegisterOpen) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await axios.get(`/orders/session/${sessionId}`, { withCredentials: true });
      console.log(data);
      setOrders(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setOrders([]);
      } else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllOrders = useCallback(async () => {
    try {
      setIsLoadingAllOrders(true);
      const { data } = await axios.get('/orders', { withCredentials: true });
      const sortedOrders = data.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.dateOrdered);
        const dateB = new Date(b.createdAt || b.dateOrdered);
        return dateB - dateA;
      });
      setAllOrders(sortedOrders);
      return sortedOrders;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch all orders');
      throw err;
    } finally {
      setIsLoadingAllOrders(false);
    }
  }, []);

  const fetchDailyStats = async () => {
    if (!isRegisterOpen || !sessionId) {
      setDailyStats({ 
        onlinePaymnt: 0, 
        cashRecvd: 0, 
        expectedCash: 0, 
        expectedOnline: 0, 
        totalSales: 0, 
        totalPendingPayment: 0, 
        orderCount: 0 
      });
      return;
    }

    setStatsLoading(true);
    try {
      const { data } = await axios.get(`/orders/daily-sales/${sessionId}`, { withCredentials: true });
      console.log('Daily stats:', data);
      setDailyStats(data);
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      setError('Failed to fetch daily statistics');
      const sessionOrders = orders.filter(order => order.registerSession === sessionId);
      setDailyStats({
        totalSales: sessionOrders.reduce((total, order) => total + (order.amountPaid || 0), 0),
        totalPendingPayment: sessionOrders.reduce((total, order) => total + (order.outstandingPayment || 0), 0),
        orderCount: sessionOrders.length
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const addOrder = async (orderData, options = {}) => {
    try {
      if (!isRegisterOpen || !sessionId) {
        try {
          await checkRegisterStatus();
        } catch (err) {
          setError(err.response?.data?.message || err.message);
          throw err;
        }
      }
      console.log("order data p2: ",orderData)
      // Validate that orderData matches the Order schema
      const formattedOrderData = {
        registerSession: sessionId,
        items: orderData.items,
        discount: orderData.discount || 0,
        paymentType: orderData.paymentType,
        actualPrice: orderData.actualPrice,     // Price before discount
        finalPrice: orderData.finalPrice,       // Price after discount
        amountPaid: orderData.amountPaid || 0,
        outstandingPayment: orderData.outstandingPayment,
        paymentStatus: orderData.outstandingPayment > 0 ? 'pending':'paid'
      };

      console.log('Adding order with schema-compliant data:', formattedOrderData);
      const { data } = await axios.post('/orders', formattedOrderData, { withCredentials: true });
      setOrders(prev => [...prev, data]);
      console.log('order placed: ', data)
      fetchDailyStats();

      // Auto-print receipt if enabled and not explicitly disabled
      if (autoPrintEnabled && options.print !== false) {
        try {
          await printReceipt(data);
          console.log('Receipt printed successfully');
        } catch (printError) {
          console.error('Failed to print receipt:', printError);
        }
      }

      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const updatePayment = async (orderId, amountReceived) => {
    try {
      const { data } = await axios.patch(`/orders/${orderId}/payment`, {
        amountReceived
      }, { withCredentials: true });

      setOrders(prev => 
        prev.map(order => 
          order._id === orderId ? data.order : order
        )
      );

      setAllOrders(prev => 
        prev.map(order => 
          order._id === orderId ? data.order : order
        )
      );

      fetchDailyStats();

      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const addOrderWithPrint = async (orderData) => {
    return addOrder(orderData, { print: true });
  };

  const addOrderWithoutPrint = async (orderData) => {
    return addOrder(orderData, { print: false });
  };

  const updateOrder = async (id, orderData) => {
    try {
      const { data } = await axios.put(`/orders/${id}`, orderData, { withCredentials: true });
      setOrders(prev => prev.map(o => o._id === id ? data : o));
      fetchDailyStats();
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const deleteOrder = async (id) => {
    try {
      await axios.delete(`/manager/delete-order/${id}`, { withCredentials: true });
      setOrders(prev => prev.filter(o => o._id !== id));
      toast.success('Order deleted successfully');
      fetchDailyStats();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const reprintReceipt = async (order) => {
    try {
      await printReceipt(order);
      return { success: true };
    } catch (printError) {
      console.error('Failed to reprint receipt:', printError);
      throw printError;
    }
  };

  return {
    orders,
    allOrders,
    isLoading,
    isLoadingAllOrders,
    error,
    dailyStats,
    statsLoading,
    isPrinting,
    autoPrintEnabled,
    setAutoPrintEnabled,
    fetchOrders,
    fetchAllOrders,
    fetchDailyStats,
    addOrder,
    addOrderWithPrint,
    addOrderWithoutPrint,
    updateOrder,
    updatePayment,
    deleteOrder,
    reprintReceipt,
  };
};

export default useOrders;