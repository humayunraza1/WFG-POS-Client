import { useState, useCallback } from 'react';
import axios from '@/api/axios';

const useReports = () => {
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  // Get all reports
  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('/reports');
      console.log('Fetched reports:', response.data);
      setReports(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
      console.error('Error fetching reports:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate new report
  const generateReport = useCallback(async (startDate = null, endDate = null) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await axios.get('/reports/create-report', { params });
      
      // Refresh reports list after generating
      await fetchReports();
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
      console.error('Error generating report:', err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [fetchReports]);

  // Get specific report by ID
  const fetchReportById = useCallback(async (reportId) => {
    try {
      setIsFetching(true);
      setError(null);
      const response = await axios.get(`/reports/get-report/${reportId}`);
      console.log('Fetched report:', response.data);
      setCurrentReport(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report');
      console.error('Error fetching report:', err);
      throw err;
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Clear current report
  const clearCurrentReport = useCallback(() => {
    setCurrentReport(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    reports,
    currentReport,
    isLoading,
    isGenerating,
    isFetching,
    error,
    fetchReports,
    generateReport,
    fetchReportById,
    clearCurrentReport,
    clearError
  };
};

export default useReports;