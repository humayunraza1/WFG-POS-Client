import { useState, useCallback } from 'react';
import axios from '@/api/axios';

const useProductAnalytics = () => {
  const [productSales, setProductSales] = useState(null);
  const [variantSales, setVariantSales] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProductAnalytics = useCallback(async (productId, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      
      if (filters.period && filters.period !== 'all') {
        params.append('period', filters.period);
      }
      
      if (filters.dateRange?.start) {
        params.append('startDate', filters.dateRange.start.toISOString());
      }
      
      if (filters.dateRange?.end) {
        params.append('endDate', filters.dateRange.end.toISOString());
      }
      
      if (filters.sessionId) {
        params.append('sessionId', filters.sessionId);
      }

      const { data } = await axios.get(`/orders/analytics/product/${productId}?${params.toString()}`);
      
      setProductSales(data.stats);
      setDailySales(data.dailySales);
      setVariantSales(null); // Clear variant data when viewing product
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error fetching product analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVariantAnalytics = useCallback(async (variantId, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      
      if (filters.period && filters.period !== 'all') {
        params.append('period', filters.period);
      }
      
      if (filters.dateRange?.start) {
        params.append('startDate', filters.dateRange.start.toISOString());
      }
      
      if (filters.dateRange?.end) {
        params.append('endDate', filters.dateRange.end.toISOString());
      }
      
      if (filters.sessionId) {
        params.append('sessionId', filters.sessionId);
      }

      const { data } = await axios.get(`/orders/analytics/variant/${variantId}?${params.toString()}`);
      
      setVariantSales(data.stats);
      setDailySales(data.dailySales);
      setProductSales(null); // Clear product data when viewing variant
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error fetching variant analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    productSales,
    variantSales,
    dailySales,
    loading,
    error,
    fetchProductAnalytics,
    fetchVariantAnalytics
  };
};

export default useProductAnalytics;