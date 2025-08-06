import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

// Create the context
const TempOrdersContext = createContext();

// Custom hook to use the context
export const useTempOrders = () => {
  const context = useContext(TempOrdersContext);
  if (!context) {
    throw new Error('useTempOrders must be used within a TempOrdersProvider');
  }
  return context;
};

// Provider component
export const TempOrdersProvider = ({ children }) => {
  const [tempOrders, setTempOrders] = useState([]);
  const {isAuthenticated} = useSelector((state)=>state.auth)
  // Load temp orders from localStorage on mount
  useEffect(() => {
    if(isAuthenticated){
      loadTempOrders();
    }
  }, [isAuthenticated]);

  const loadTempOrders = () => {
    try {
      const stored = localStorage.getItem('temp-orders');
      if (stored) {
        const orders = JSON.parse(stored);
        setTempOrders(orders);
      }
    } catch (error) {
      console.error('Error loading temp orders:', error);
      setTempOrders([]);
    }
  };

  const saveTempOrders = (orders) => {
    try {
      localStorage.setItem('temp-orders', JSON.stringify(orders));
      setTempOrders(orders);
    } catch (error) {
      console.error('Error saving temp orders:', error);
    }
  };

  const removeOrder = (index) => {
    const updatedOrders = tempOrders.filter((_, i) => i !== index);
    saveTempOrders(updatedOrders);
  };

  const clearAllOrders = () => {
    localStorage.removeItem('temp-orders');
    setTempOrders([]);
  };

  const addTempOrder = (orderData) => {
    const newOrder = {
      id: Date.now(), // Simple ID based on timestamp
      items: Array.isArray(orderData) ? orderData : (orderData?.items || []),
      serverName: orderData.serverName || 'Unknown Server',
      time: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    const existingOrders = [...tempOrders, newOrder];
    saveTempOrders(existingOrders);

    //console.log("add temp order ran, ", orderData);
  };

  const value = {
    tempOrders,
    setTempOrders,
    loadTempOrders,
    addTempOrder,
    clearAllOrders,
    removeOrder
  };

  return (
    <TempOrdersContext.Provider value={value}>
      {children}
    </TempOrdersContext.Provider>
  );
};

export default TempOrdersProvider;