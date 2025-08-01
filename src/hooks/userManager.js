// src/hooks/useManager.js
import { useState, useEffect } from 'react';
import axiosPublic,{axiosPrivate} from '@/api/axios';

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
      const res = await axiosPrivate.get(url);
      console.log('Fetched Summary:', res.data); // Debugging line
      setSummary(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  async function fetchEmployeesByRole(role){
    try{
      const res = await axiosPrivate.get(`/manager?role=${role}`)
      return res.data
    }catch(err){
      console.log(err)
    }
  }

  async function assignManagers(id,managers){
    try{
      const res = await axiosPrivate.put('/branch/assign-manager',{branchId:id,managerIds:managers})
      console.log(res.data)
      return res.data
    }catch(err){
      console.log(err)
    }
  }

// Updated: Add Account (standalone account creation without employee linking)
const addAccount = async (accountData) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await axiosPrivate.post('/manager/add-account', {
      username: accountData.username,
      password: accountData.password,
      access: accountData.access,
      branchCode:accountData.branchCode
    });
    
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

// New: Assign Account to Employee
const assignAccountToEmployee = async (accountId, employeeId) => {
  try {
    setError(null);
    
    const response = await axiosPrivate.put('/manager/assign-account', {
      accId: accountId,
      empId: employeeId
    });
    
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to assign account';
    setError(errorMessage);
    
    throw {
      message: errorMessage,
      status: err.response?.status
    };
  }
};

// Updated: Update Account (now handles username, password, and access)
const updateAccount = async (accountId, payload) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await axiosPrivate.put(`/manager/edit-account/${accountId}`, {
      username: payload.username,
      password: payload.password,
      branchCode: payload.branchCode,
      access: payload.access
    });
    
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message;
    const deniedPermissions = err.response?.data?.denied || [];
    
    setError(errorMessage);
    
    throw {
      message: errorMessage,
      denied: deniedPermissions,
      status: err.response?.status
    };
  } finally {
    setLoading(false);
  }
};

// New: Update Account Status (activate/deactivate)
const updateAccountStatus = async (accountId, status) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await axiosPrivate.put('/manager/account-status', {
      accId: accountId,
      status: status
    });
    
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message;
    setError(errorMessage);
    
    throw {
      message: errorMessage,
      status: err.response?.status
    };
  } finally {
    setLoading(false);
  }
};

// New: Fetch All Accounts
const fetchAccounts = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await axiosPrivate.get('/manager/accounts');
    
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch accounts';
    setError(errorMessage);
    
    throw {
      message: errorMessage,
      status: err.response?.status
    };
  } finally {
    setLoading(false);
  }
};

// Updated: Get Account Details (already exists but keeping for completeness)
const getAccountDetails = async (accountId) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await axiosPrivate.get(`/manager/account/${accountId}`);
    
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch account details';
    setError(errorMessage);
    
    throw {
      message: errorMessage,
      status: err.response?.status
    };
  } finally {
    setLoading(false);
  }
};
const fetchEmployeesWithoutAccounts = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await axiosPrivate.get('/manager/employees-without-accounts');
    
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch available employees';
    setError(errorMessage);
    
    throw {
      message: errorMessage,
      status: err.response?.status
    };
  } finally {
    setLoading(false);
  }
};


const addEmployee = async (employeeData) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await axiosPrivate.post('/manager/add-employee', employeeData);
    
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

async function updateEmployee(id, employeeData){
  try{
    const res = await axiosPrivate.put('/manager/update-employee',{id,employeeData})
    console.log(res.data)
  }catch(err){
    console.log(err)
  }
}

  const fetchActiveRegisters = async () => {
    try {
      setLoading(true);
      const res = await axiosPrivate.get('/manager/registers/active');
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
      const res = await axiosPrivate.get('/manager/employees');
      return res.data
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
      const res = await axiosPrivate.get(`/manager/register/sessions${query ? '?' + query : ''}`);
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
      const res = await axiosPrivate.get('/manager/orders');
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
      const res = await axiosPrivate.get('/manager/expenses');
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
      
      const response = await axiosPrivate.get(url);
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
      
      const response = await axiosPrivate.post(`/employee/pay/${employeeId}`, paymentData);
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
    fetchAccounts,
    assignManagers,
    fetchEmployeesWithoutAccounts,
    updateAccountStatus,
    assignAccountToEmployee,
    fetchEmployeesByRole,
    addEmployeePayment,
    getAccountDetails,
    updateAccount,
    getEmployeePayments,
    addAccount,
    addEmployee,
    updateEmployee,
    fetchSummary,
    fetchActiveRegisters,
    fetchEmployees,
    fetchRegisterSessions,
    fetchOrders,
    fetchExpenses
  };
};

export default useManager;
