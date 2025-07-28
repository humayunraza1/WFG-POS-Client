// src/context/PreferencesContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import {axiosPrivate} from '@/api/axios'; // or wherever your axios instance lives

const PreferencesContext = createContext();

export const PreferencesProvider = ({ children }) => {
  const [accountPrefs, setAccountPrefs] = useState(null);
  const [businessPrefs, setBusinessPrefs] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const [accountRes, businessRes] = await Promise.all([
          axiosPrivate.get('/settings/account'),
          axiosPrivate.get('/settings/business'),
        ]);
        setAccountPrefs(accountRes.data);
        setBusinessPrefs(businessRes.data);

        console.log("account settings: ", accountRes.data)
        console.log("business settings: ", businessRes.data)
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  // Utility to update a specific preference
  const updatePreference = async (type, key, value) => {
    try {
      const res = await axiosPrivate.put(`/settings/${type}`, { key, value });
      if (type === 'account') {
        setAccountPrefs((prev) => ({ ...prev, [key]: value }));
      } else {
        setBusinessPrefs((prev) => ({ ...prev, [key]: value }));
      }
      return { success: true };
    } catch (err) {
      console.error(`Failed to update ${type} preference:`, err);
      return { success: false, error: err };
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        loading,
        accountPrefs,
        businessPrefs,
        updatePreference,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext);
