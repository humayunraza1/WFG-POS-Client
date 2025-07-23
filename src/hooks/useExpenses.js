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

  const fetchExpenses = async () => {
    if (!sessionId || !isRegisterOpen) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await axiosPrivate.get(`/expenses/session/${sessionId}`,{withCredentials:true});
      setExpenses(data);
    } catch (err) {
      // If it's a 404, just set empty array (new session)
      if (err.response?.status === 404) {
        setExpenses([]);
      } else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async (expenseData,sessionId) => {
    try {
      const { data } = await axiosPrivate.post(`/manager/add-expense`, {
        ...expenseData,
        registerSession: sessionId
      },{withCredentials:true});
      setExpenses(prev => [...prev, data]);
      
      // Call the callback to update dashboard stats
      if (onExpenseChange) {
        onExpenseChange();
      }
      
      return data;
    } catch (err) {
      console.error('Error adding expense:', err);
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const { data } = await axiosPrivate.put(`/manager/update-expense/${id}`, expenseData,{withCredentials:true});
      setExpenses(prev => prev.map(e => e._id === id ? data : e));
      
      // Call the callback to update dashboard stats
      if (onExpenseChange) {
        onExpenseChange();
      }
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axiosPrivate.delete(`/manager/delete-expense/${id}`,{withCredentials:true});
      setExpenses(prev => prev.filter(e => e._id !== id));
      
      // Call the callback to update dashboard stats
      if (onExpenseChange) {
        onExpenseChange();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  return {
    expenses,
    isLoading,
    error,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
};

export default useExpenses;