import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import registerReducer from '@/features/registers/registerSlice';
import ordersReducer from '@/features/orders/ordersSlice';
import settingsReducer from '@/features/settings/settingsSlice';
import { ordersAPI } from '../features/orders/ordersAPI';
// import registerReducer from '@/features/register/registerSlice';
// import ordersReducer from '@/features/orders/ordersSlice';

// import { registerAPI } from '@/features/register/registerAPI';
// import { ordersAPI } from '@/features/orders/ordersAPI';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    register: registerReducer,
    orders: ordersReducer,
    settings: settingsReducer,
    // // RTK Query APIs (must match reducerPath)
    // [registerAPI.reducerPath]: registerAPI.reducer,
    [ordersAPI.reducerPath]: ordersAPI.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      // registerAPI.middleware,
      ordersAPI.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
});
