// hooks/useOrders.js
import { useState, useEffect, useCallback } from 'react';
import axiosPublic,{axiosPrivate} from '@/api/axios';
import useReceiptPrinter from './useReceiptPrinter';
import { useSelector } from 'react-redux';

const useOrders = (sessionId, isRegisterOpen) => {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAllOrders, setIsLoadingAllOrders] = useState(false);
  const [error, setError] = useState(null);
  const [dailyStats, setDailyStats] = useState({ 
    cashRecvd: 0,
    onlinePaymnt: 0,
    cardPaymnt: 0,
    digitalPaymnt: 0,
    expectedCash: 0,
    expectedOnline: 0,
    expectedCard: 0,
    expectedDigital: 0,
    totalSales: 0, 
    totalPendingPayment: 0, 
    orderCount: 0 
  });
  const {accountPrefs} = useSelector((state)=>state.settings);
  const [statsLoading, setStatsLoading] = useState(false);
  
  const { printReceipt, isPrinting } = useReceiptPrinter();

  // Clear state when register is closed
  useEffect(() => {
    if (!isRegisterOpen) {
      setOrders([]);
      setDailyStats({
        cashRecvd: 0,
        onlinePaymnt: 0, 
        cardPaymnt: 0,
        digitalPaymnt: 0,
        expectedCash: 0,
        expectedOnline: 0,
        expectedCard: 0,
        expectedDigital: 0,
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
        cardPaymnt: 0,
        digitalPaymnt: 0,
        expectedCash: 0,
        expectedOnline: 0,
        expectedCard: 0,
        expectedDigital: 0,
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
        cardPaymnt: 0,
        digitalPaymnt: 0,
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
      const { data } = await axiosPrivate.get(`/orders/session/${sessionId}`, { withCredentials: true });
      //console.log(data);
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
      const { data } = await axiosPrivate.get('/orders', { withCredentials: true });
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
        cardPaymnt: 0,
        digitalPaymnt: 0,
        cashRecvd: 0, 
        expectedCash: 0, 
        expectedOnline: 0, 
        expectedCard: 0,
        expectedDigital: 0,
        totalSales: 0, 
        totalPendingPayment: 0, 
        orderCount: 0 
      });
      return;
    }

    setStatsLoading(true);
    try {
      const { data } = await axiosPrivate.get(`/orders/daily-sales/${sessionId}`, { withCredentials: true });
      //console.log('Daily stats:', data);
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

  const addOrderWithPrint = async (orderData) => {
    return addOrder(orderData, { print: true });
  };

  const addOrderWithoutPrint = async (orderData) => {
    return addOrder(orderData, { print: false });
  };

  const updateOrder = async (id, orderData) => {
    try {
      const { data } = await axiosPrivate.put(`/orders/${id}`, orderData, { withCredentials: true });
      setOrders(prev => prev.map(o => o._id === id ? data : o));
      fetchDailyStats();
      return data;
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
    fetchOrders,
    fetchAllOrders,
    fetchDailyStats,
    addOrderWithPrint,
    addOrderWithoutPrint,
    updateOrder,
    reprintReceipt,
  };
};

export default useOrders;