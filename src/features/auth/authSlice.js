import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosPublic,{ axiosPrivate } from '@/api/axios';
import { getSettings } from '../settings/settingsSlice';

export const login = createAsyncThunk('auth/login', async ({ username, password }, { rejectWithValue, dispatch }) => {
  try {
    const res = await axiosPrivate.post('/auth/login', { username, password });
    await dispatch(getSettings());
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await axiosPrivate.post('/auth/logout');
});

export const createAccount = createAsyncThunk('auth/createAccount', async ({ username, password }, { rejectWithValue }) => {
  try {
    const res = await axiosPrivate.post('/auth/create', { username, password });
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const checkAuth = createAsyncThunk('auth/check', async (_, { rejectWithValue,dispatch }) => {
  try {
    const res = await axiosPrivate.get('/auth/me');
    await dispatch(getSettings());
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending,(state)=>{
        state.isLoading = true
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.isLoading = false
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.pending,(state)=>{
        state.isLoading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false
      });
  }
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
