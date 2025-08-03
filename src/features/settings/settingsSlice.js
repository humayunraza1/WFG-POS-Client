import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosPrivate } from '@/api/axios';

// Async thunk to fetch both settings
export const getSettings = createAsyncThunk(
  'settings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const [accountRes, businessRes] = await Promise.all([
        axiosPrivate.get('/settings/account'),
        axiosPrivate.get('/settings/business'),
      ]);
      return {
        accountPrefs: accountRes.data,
        businessPrefs: businessRes.data,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to update a specific setting
export const updateSetting = createAsyncThunk(
  'settings/update',
  async ({ type, key, value }, { rejectWithValue }) => {
    try {
      await axiosPrivate.put(`/settings/${type}`, { key, value });
      return { type, key, value };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    accountPrefs: null,
    businessPrefs: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accountPrefs = action.payload.accountPrefs;
        state.businessPrefs = action.payload.businessPrefs;
      })
      .addCase(getSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateSetting.pending,(state)=>{
        state.isLoading = true
      })
      .addCase(updateSetting.fulfilled, (state, action) => {
        const { type, key, value } = action.payload;
        if (type === 'account') {
          state.accountPrefs = { ...state.accountPrefs, [key]: value };
        } else {
          state.businessPrefs = { ...state.businessPrefs, [key]: value };
        }
        state.isLoading = false
      })
      .addCase(updateSetting.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});

export default settingsSlice.reducer;
