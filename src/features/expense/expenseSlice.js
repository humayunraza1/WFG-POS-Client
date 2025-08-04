// features/expenses/expenseSlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import {axiosPrivate} from '@/api/axios';

export const addExpense = createAsyncThunk(
  'expenses/add',
  async ({ expenseData, sessionId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosPrivate.post(
        `/expenses`,
        { ...expenseData, registerSession: sessionId },
        { withCredentials: true }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/update',
  async ({ id, expenseData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosPrivate.put(
        `/expenses/update/${id}`,
        expenseData,
        { withCredentials: true }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosPrivate.delete(`/expenses/delete/${id}`, {
        withCredentials: true,
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const expenseSlice = createSlice({
  name: 'expenses',
  initialState: {
    expenses: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearExpenseError: (state) => {
      state.error = null;
    },
        setExpenses: (state, action) => {
      state.expenses = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addExpense.fulfilled, (state, action) => {
        state.expenses.push(action.payload);
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(e => e._id === action.payload._id);
        if (index !== -1) state.expenses[index] = action.payload;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(e => e._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('expenses/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('expenses/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.isLoading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('expenses/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'An error occurred';
        }
      );
  },
});

export const { clearExpenseError,setExpenses } = expenseSlice.actions;
export default expenseSlice.reducer;

export const selectExpenses = (state) => state.expense.expenses || [];

// Memoized selector to calculate total
export const selectTotalExpenses = createSelector(
  selectExpenses,
  (expenses) => expenses.reduce((total, exp) => total + exp.amount, 0)
);