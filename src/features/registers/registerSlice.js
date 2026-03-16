import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosPrivate } from '@/api/axios';
import statsAPI from '../stats/statsAPI';
import { ordersAPI } from '../orders/ordersAPI';

export const checkRegisterStatus = createAsyncThunk('register/status', async (_,{rejectWithValue}) => {
  try{
      const res = await axiosPrivate.get('/register/status');
    return res.data;
  }catch(err){
    return rejectWithValue(err.response?.data?.message || err.message)
  }
});

export const openRegister = createAsyncThunk('register/open', async (data,{rejectWithValue}) => {
    try{
        const res = await axiosPrivate.post('/register/open', data);
        return res.data;
    }catch(err){
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const closeRegister = createAsyncThunk('register/close', async (finalCash,{rejectWithValue, dispatch}) => {
 try{
     const res = await axiosPrivate.post('/register/close', { finalCash });
     dispatch(statsAPI.util.resetApiState());
     dispatch(ordersAPI.util.resetApiState());
   return res.data;
 }catch(err){
        return rejectWithValue(err.response?.data?.message || err.message);
 }
});

const registerSlice = createSlice({
  name: 'register',
  initialState: {
    isOpen: false,
    sessionId: null,
    registerData: null,
    isLoading: false,
    error: null
  },
  reducers:{
    setSessionId: (state,action)=>{
      state.sessionId = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
    .addCase(checkRegisterStatus.pending,(state)=>{
        state.isLoading = true
    })
      .addCase(checkRegisterStatus.fulfilled, (state, action) => {
        const { isOpen, sessionId, register } = action.payload;
        state.isOpen = isOpen;
        state.sessionId = sessionId;
        state.registerData = register;
        state.isLoading = false
      })
      .addCase(openRegister.pending,(state)=>{
        state.isLoading = true
      })
      .addCase(openRegister.fulfilled, (state, action) => {
        state.isOpen = true;
        state.sessionId = action.payload.sessionId;
        state.registerData = action.payload;
        state.isLoading = false
      })
      .addCase(openRegister.rejected,(state,action)=>{
            state.error = action.payload
            state.isLoading = false
      })
      .addCase(closeRegister.pending,(state)=>{
        state.isLoading=true
      })
      .addCase(closeRegister.fulfilled, (state) => {
        state.isOpen = false;
        state.sessionId = null;
        state.registerData = null;
        state.isLoading = false
      })
      .addCase(closeRegister.rejected,(state,action)=>{
        state.error = action.payload
        state.isLoading = false
      });
  }
});

export const { setSessionId } = registerSlice.actions;
export default registerSlice.reducer;
