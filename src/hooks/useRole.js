// src/hooks/useRole.js
import {axiosPrivate} from '@/api/axios';
import { toast } from 'sonner';
import { useState } from 'react';

export default function useRole() {
  const [loading, setLoading] = useState(false);

  const addRole = async (name) => {
    try {
      setLoading(true);
      await axiosPrivate.post('/roles/create', { name });
      toast.success(`${name} role added`);
    } catch (err) {
      toast.error('Failed to add role');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const editRole = async (id, name) => {
    try {
      setLoading(true);
      await axiosPrivate.put('/roles/edit', { id, name });
      toast.success(`Role updated to ${name}`);
    } catch (err) {
      toast.error('Failed to update role');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { addRole, editRole, loading };
}
