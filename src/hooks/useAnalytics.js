import { useState, useCallback } from 'react';
import axios from '@/api/axios';

const useAnalytics = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [topVariants, setTopVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTopSellers = useCallback(async (filters = {}) => {
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
      
      params.append('limit', '10');

      // Fetch both top products and variants
      const [productsResponse, variantsResponse] = await Promise.all([
        axios.get(`/orders/analytics/top-products?${params.toString()}`),
        axios.get(`/orders/analytics/top-variants?${params.toString()}`)
      ]);

      setTopProducts(productsResponse.data);
      setTopVariants(variantsResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error fetching top sellers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    topProducts,
    topVariants,
    loading,
    error,
    fetchTopSellers
  };
};

export default useAnalytics;