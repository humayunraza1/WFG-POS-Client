import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosPrivate} from '@/api/axios';

// Thunks
export const fetchBranches = createAsyncThunk('branch/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await axiosPrivate.get('/branch/');
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch branches');
  }
});

export const addBranch = createAsyncThunk('branch/add', async (branchData, thunkAPI) => {
  try {
    const res = await axiosPrivate.post('/branch/add-branch', {
      name: branchData.name,
      address: branchData.address,
      phone: branchData.phone,
      code: branchData.code
    });
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to add branch');
  }
});

export const updateBranch = createAsyncThunk('branch/update', async ({ id, ...branchData }, thunkAPI) => {
  try {
    const res = await axiosPrivate.put('/branch/edit', {
      id,
      name: branchData.name,
      address: branchData.address,
      phone: branchData.phone,
      isActive: branchData.isActive
    });
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to update branch');
  }
});

// Slice
const branchSlice = createSlice({
  name: 'branch',
  initialState: {
    branches: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearBranchError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchBranches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.branches = action.payload;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add
      .addCase(addBranch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addBranch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.branches.push(action.payload);
      })
      .addCase(addBranch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateBranch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload;
        const index = state.branches.findIndex(branch => branch._id === updated._id);
        if (index !== -1) {
          state.branches[index] = updated;
        }
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBranchError } = branchSlice.actions;
export default branchSlice.reducer;
