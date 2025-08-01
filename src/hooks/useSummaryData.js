import { useState, useCallback } from 'react';
import axiosPublic,{axiosPrivate} from '@/api/axios';

const useSummaryData = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummaryData = useCallback(async (period = 'all', dateRange = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('period', period);
      
      if (dateRange.start) {
        params.append('startDate', dateRange.start.toISOString());
      }
      if (dateRange.end) {
        params.append('endDate', dateRange.end.toISOString());
      }

      const { data } = await axiosPrivate.get(`/orders/summary?${params.toString()}`);
      setSummaryData(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error fetching summary data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    summaryData,
    loading,
    error,
    fetchSummaryData
  };
};

export default useSummaryData;