import { useState, useEffect, useCallback } from 'react';
import axiosPublic,{axiosPrivate} from '@/api/axios';

const useRegister = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [registerData, setRegisterData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for sessions
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState(null);

  // New state for managers
  const [managers, setManagers] = useState([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [managersError, setManagersError] = useState(null);

  // Check register status on mount and restore state if needed
  useEffect(() => {
    checkRegisterStatus();
    // fetchManagers();
  }, []);

  // Update activity every 5 minutes
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(updateActivity, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // const fetchManagers = async () => {
  //   try {
  //     setManagersLoading(true);
  //     const { data } = await axiosPrivate.get('/register/managers');
  //     setManagers(data.managers);
  //     setManagersError(null);
  //   } catch (err) {
  //     const errorMessage = err.response?.data?.message || err.message;
  //     setManagersError(errorMessage);
  //     console.error('Error fetching managers:', errorMessage);
  //   } finally {
  //     setManagersLoading(false);
  //   }
  // };

  const checkRegisterStatus = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosPrivate.get(`/register/status`, { withCredentials: true });

      if (data.isOpen) {
        setIsOpen(true);
        setSessionId(data.sessionId);
        //console.log(data);
        setRegisterData(data.register);
        // Return the data so other hooks can use it
        return data;
      } else {
        setIsOpen(false);
        setSessionId(null);
        setRegisterData(null);
        return null;
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const openRegister = async (registerData) => {
    try {
      // Handle both old format (just startCash) and new format (object with startCash and manager)
      const requestData = typeof registerData === 'number' 
        ? { startCash: registerData } 
        : registerData;

      const { data } = await axiosPrivate.post(`/register/open`, requestData, { withCredentials: true } );
      
      setIsOpen(true);
      setSessionId(data.sessionId);
      setRegisterData(data);
      setError(null);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const closeRegister = async (finalCash) => {
    try {
      const { data } = await axiosPrivate.post(`/register/close`, {
        finalCash
      }, { withCredentials: true });
      
      setIsOpen(false);
      setSessionId(null);
      setRegisterData(null);
      setError(null);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateActivity = async () => {
    if (!isOpen) return;
    
    try {
      await axiosPrivate.post(`/register/activity`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Failed to update activity:', err);
    }
  };

  // Updated function to fetch all register sessions with manager filter
  const fetchSessions = useCallback(async (filters = { start: null, end: null, manager: 'ALL' }) => {
    try {
      setSessionsLoading(true);
      setSessionsError(null);

      // Build query parameters
      const params = {};
      if (filters.start) {
        params.startDate = filters.start.toISOString();
      }
      if (filters.end) {
        params.endDate = filters.end.toISOString();
      }
      if (filters.manager && filters.manager !== 'ALL') {
        params.manager = filters.manager;
      }

      const { data } = await axiosPrivate.get('/manager/register/sessions', { params }, { withCredentials: true });
      
      // Sort sessions by openedAt date, most recent first
      const sortedSessions = data.sort((a, b) => 
        new Date(b.openedAt) - new Date(a.openedAt)
      );
      
      setSessions(sortedSessions);
      return sortedSessions;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setSessionsError(errorMessage);
      console.error('Error fetching register sessions:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  // Function to get a specific session by ID
  const getSessionById = useCallback(async (sessionId) => {
    try {
      const { data } = await axiosPrivate.get(`/manager/register/sessions/${sessionId}`, { withCredentials: true });
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setSessionsError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    // Existing register operations
    isOpen,
    sessionId,
    registerData,
    isLoading,
    error,
    openRegister,
    closeRegister,
    checkRegisterStatus,

    // Sessions functionality
    sessions,
    sessionsLoading,
    sessionsError,
    fetchSessions,
    getSessionById,

    // Managers functionality
    managers,
    managersLoading,
    managersError
  };
};

export default useRegister;