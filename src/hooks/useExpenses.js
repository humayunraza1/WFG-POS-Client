import { useState, useEffect } from 'react';
import axiosPublic,{axiosPrivate} from '@/api/axios';

const useExpenses = (sessionId, isRegisterOpen, onExpenseChange) => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear state when register is closed
  useEffect(() => {
    if (!isRegisterOpen) {
      setExpenses([]);
      setError(null);
    }
  }, [isRegisterOpen]);

  // Fetch expenses when sessionId becomes available or changes
  useEffect(() => {
    if (sessionId && isRegisterOpen) {
      // Clear previous data first
      setExpenses([]);
      fetchExpenses();
    } else {
      setIsLoading(false);
      setExpenses([]);
    }
  }, [sessionId, isRegisterOpen]);


  return {  };
};

export default useExpenses;