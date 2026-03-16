import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosPublic,{ axiosPrivate } from '@/api/axios';
import { getSettings } from '../settings/settingsSlice';
import statsAPI from '../stats/statsAPI';
import { ordersAPI } from '../orders/ordersAPI';

export const login = createAsyncThunk('auth/login', async ({ username, password }, { rejectWithValue, dispatch }) => {
  try {
    const res = await axiosPublic.post('/auth/login', { username, password });
    // await dispatch(getSettings());
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  try {
    await axiosPrivate.post('/auth/logout');
  } finally {
    dispatch(statsAPI.util.resetApiState());
    dispatch(ordersAPI.util.resetApiState());
  }
});

export const createAccount = createAsyncThunk('auth/createAccount', async ({ username, password }, { rejectWithValue }) => {
  try {
    const res = await axiosPrivate.post('/auth/create', { username, password });
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});


export const refresh = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosPrivate.get('/auth/refresh'); // assumes it returns accessToken + user
      // Optionally fetch settings or other dependent data
      // await dispatch(getSettings());

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosPrivate.get('/auth/me'); // assumes it returns accessToken + user
      // Optionally fetch settings or other dependent data
      // await dispatch(getSettings());

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending,(state)=>{
        state.isLoading = true
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.isLoading = false
        state.accessToken = action.payload.accessToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(refresh.pending,(state)=>{
        state.isLoading = true
      })
      .addCase(refresh.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(refresh.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.accessToken = null;
      })
      .addCase(checkAuth.pending,(state)=>{
        state.isLoading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  }
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
