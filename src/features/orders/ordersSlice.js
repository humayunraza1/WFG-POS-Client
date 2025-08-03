import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import { axiosPrivate } from '@/api/axios';
import { add } from 'date-fns';

export const addOrder = createAsyncThunk('orders/add', async (orderData,{rejectWithValue}) => {
    try{
        const res = await axiosPrivate.post('/orders', {orderData});
        return res.data;
    }catch(err){
         return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const updatePayment = createAsyncThunk('orders/payment',async({orderId,amountReceived},{rejectWithValue})=>{
  try{
    const {data} = await axiosPrivate.patch(`/orders/${orderId}/payment`,{amountReceived})
    return data
  }catch(err){
    return rejectWithValue(err.response?.data?.message || err.message);
  }
})

export const deleteOrder = createAsyncThunk('orders/delete',async(id,{rejectWithValue})=>{
  try{
    const {data} = await axiosPrivate.delete(`/orders/delete/${id}`)
    return data
  }catch(err){
    return rejectWithValue(err.response?.data?.message || err.message);
  }
})
// updateOrder, updatePayment, deleteOrder = similar

const ordersAdapter = createEntityAdapter({ selectId: (order) => order._id });

const initialState = ordersAdapter.getInitialState({
  isLoading: false,
  error: null
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
        setAllOrders: ordersAdapter.setAll,
    clearOrders: ordersAdapter.removeAll
  },
  extraReducers: (builder) => {
    builder
    .addCase(addOrder.pending,(state)=>{
        state.isLoading = true
    })
      .addCase(addOrder.fulfilled, (state, action) => {
        state.isLoading = false
        ordersAdapter.addOne(state, action.payload);
      })
    .addCase(addOrder.rejected,(state,action)=>{
        state.error = action.payload
        state.isLoading = false
    })
    .addCase(updatePayment.pending,(state)=>{
      state.isLoading = true
    })
    .addCase(updatePayment.fulfilled,(state,action)=>{
      state.isLoading = false
      ordersAdapter.upsertOne(state, action.payload.order);
    })
    .addCase(updatePayment.rejected,(state,action)=>{
      state.isLoading = false
      state.error = action.payload
    })
    .addCase(deleteOrder.pending,(state)=>{
      state.isLoading = true
    })
    .addCase(deleteOrder.fulfilled,(state,action)=>{
      ordersAdapter.removeOne(state, action.payload.id);
      state.isLoading = false
    })
    .addCase(deleteOrder.rejected,(state,action)=>{
      state.isLoading = true
      state.error = action.payload
    })
  }
});

export const {
  selectAll: selectAllOrders,
  selectById: selectOrderById,
  selectIds: selectOrderIds
} = ordersAdapter.getSelectors((state) => state.orders);

export const { setAllOrders, clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
