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
      setSummary(res.data);
    } catch (err) {
      setError(err.message);
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

  return {
    summary,
    activeRegisters,
    allEmployees,
    sessions,
    orders,
    expenses,
    loading,
    error,
    fetchSummary,
    fetchActiveRegisters,
    fetchEmployees,
    fetchRegisterSessions,
    fetchOrders,
    fetchExpenses
  };
};

export default useManager;
