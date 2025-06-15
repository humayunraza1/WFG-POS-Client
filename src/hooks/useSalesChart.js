import { useState, useCallback } from 'react';
import axios from '@/api/axios';

const useSalesChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChartData = useCallback(async (type = 'overview', period = 'weekly', metric = 'revenue') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('type', type);
      params.append('period', period);
      params.append('metric', metric);

      const { data } = await axios.get(`/orders/analytics/chart?${params.toString()}`);
      setChartData(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error fetching chart data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    chartData,
    loading,
    error,
    fetchChartData
  };
};

export default useSalesChart;