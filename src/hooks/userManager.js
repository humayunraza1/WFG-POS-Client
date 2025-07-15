// src/hooks/useManager.js
import { useState, useEffect } from 'react';
import axios from '@/api/axios';

const useManager = () => {
  const [summary, setSummary] = useState(null);
  const [activeRegisters, setActiveRegisters] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = async (sessionId = null) => {
    try {
      setLoading(true);
      const url = sessionId ? `/manager/registers/summary?sessionId=${sessionId}` : '/manager/registers/summary';
      const res = await axios.get(url);
      console.log('Fetched Summary:', res.data); // Debugging line
      setSummary(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  async function updateAccount(id,payload){
    try{
      const res = await axios.put(`/manager/edit-account/${id}`,{username:payload.username,password:payload.password,access:payload.access})
      console.log(res.data)
    }catch(err){
      console.log(err)
    }
  }

  const addAccount = async (employeeId, accountData) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await axios.post('/manager/add-account', {
      employeeId,
      ...accountData
    });
    
    // Refresh employees list after successful account creation
    await fetchEmployees();
    
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message;
    const deniedPermissions = err.response?.data?.denied || [];
    
    setError(errorMessage);
    
    // Return error details for the component to handle
    throw {
      message: errorMessage,
      denied: deniedPermissions,
      status: err.response?.status
    };
  } finally {
    setLoading(false);
  }
};

async function getAccountDetails(accountId){
  try{
    const res = await axios.get(`/manager/account/${accountId}`)
    return res.data
  }catch(err){
    console.log(err)
  }
}

const addEmployee = async (employeeData) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await axios.post('/manager/add-employee', employeeData);
    
    // Refresh employees list after successful employee creation
    await fetchEmployees();
    
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message;
    setError(errorMessage);
    
    throw {
      message: errorMessage,
      status: err.response?.status
    };
  } finally {
    setLoading(false);
  }
};

  const fetchActiveRegisters = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/manager/registers/active');
      setActiveRegisters(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/manager/employees');
      setAllEmployees(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisterSessions = async (params = {}) => {
    try {
      setLoading(true);
      const query = new URLSearchParams(params).toString();
      const res = await axios.get(`/manager/register/sessions${query ? '?' + query : ''}`);
      setSessions(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/manager/orders');
      setOrders(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/manager/expenses');
      setExpenses(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

   const getEmployeePayments = async (employeeId, month, year) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      
      const queryString = params.toString();
      const url = `/employee/${employeeId}/payments${queryString ? '?' + queryString : ''}`;
      
      const response = await axios.get(url);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      
      throw {
        message: errorMessage,
        status: err.response?.status
      };
    } finally {
      setLoading(false);
    }
  };


    const addEmployeePayment = async (employeeId, paymentData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`/employee/pay/${employeeId}`, paymentData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      
      throw {
        message: errorMessage,
        status: err.response?.status
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    summary,
    activeRegisters,
    allEmployees,
    sessions,
    orders,
    expenses,
    loading,
    error,
    addEmployeePayment,
    getAccountDetails,
    updateAccount,
    getEmployeePayments,
    addAccount,
    addEmployee,
    fetchSummary,
    fetchActiveRegisters,
    fetchEmployees,
    fetchRegisterSessions,
    fetchOrders,
    fetchExpenses
  };
};

export default useManager;
