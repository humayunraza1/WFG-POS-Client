import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosPrivate} from '@/api/axios'; // adjust this path as needed

// Thunks
export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAll',
  async (_, thunkAPI) => {
    try {
      const res = await axiosPrivate.get('/manager/accounts');
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const addAccount = createAsyncThunk(
  'accounts/add',
  async (accountData, thunkAPI) => {
    try {
      const res = await axiosPrivate.post('/manager/add-account', accountData);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || err.message,
        denied: err.response?.data?.denied || []
      });
    }
  }
);

export const assignAccountToEmployee = createAsyncThunk(
  'accounts/assignToEmployee',
  async ({ accId, empId }, thunkAPI) => {
    try {
      const res = await axiosPrivate.put('/manager/assign-account', { accId, empId });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateAccount = createAsyncThunk(
  'accounts/update',
  async ({ accountId, status }, thunkAPI) => {
    try {
      const res = await axiosPrivate.put(`/manager/edit-account/${accountId}`, status);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || err.message,
        denied: err.response?.data?.denied || []
      });
    }
  }
);

export const updateAccountStatus = createAsyncThunk(
  'accounts/updateStatus',
  async ({ accountId, newStatus }, thunkAPI) => {
    try {
      const res = await axiosPrivate.put('/manager/account-status', {
        accId: accountId,
        newStatus
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice
const accountSlice = createSlice({
  name: 'accounts',
  initialState: {
    accounts: [],
    loading: false,
    error: null
  },
  reducers: {
    clearAccountError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder

      // Fetch
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add
      .addCase(addAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts.push(action.payload);
      })
      .addCase(addAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Assign
      .addCase(assignAccountToEmployee.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.accounts.findIndex(acc => acc._id === updated._id);
        if (index !== -1) {
          state.accounts[index] = updated;
        }
      })
      .addCase(assignAccountToEmployee.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update
      .addCase(updateAccount.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.accounts.findIndex(acc => acc._id === updated._id);
        if (index !== -1) {
          state.accounts[index] = updated;
        }
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update Status
      .addCase(updateAccountStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.accounts.findIndex(acc => acc._id === updated._id);
        if (index !== -1) {
          state.accounts[index] = updated;
        }
      })
      .addCase(updateAccountStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearAccountError } = accountSlice.actions;
export default accountSlice.reducer;
