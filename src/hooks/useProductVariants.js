import { useState, useCallback } from 'react';
import axios from '@/api/axios';

const useProductVariants = () => {
  const [productVariants, setProductVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProductVariants = useCallback(async (productId, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('productId', productId);
      
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
      
      params.append('limit', '20'); // Get more variants since it's for one product

      const { data } = await axios.get(`/orders/analytics/product-variants?${params.toString()}`);
      setProductVariants(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error fetching product variants:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearVariants = useCallback(() => {
    setProductVariants([]);
    setError(null);
  }, []);

  return {
    productVariants,
    loading,
    error,
    fetchProductVariants,
    clearVariants
  };
};

export default useProductVariants;