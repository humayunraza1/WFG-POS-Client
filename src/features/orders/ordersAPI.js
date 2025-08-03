import { createApi } from '@reduxjs/toolkit/query/react';
import {axiosBaseQuery} from '@/api/axiosBaseQuery'
export const ordersAPI = createApi({
  reducerPath: 'ordersAPI',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    getOrdersBySession: builder.query({
      query: (sessionId) => ({
        url: `/orders/session/${sessionId}`,
        method: 'GET',
      }),
      providesTags: ['Orders'],
      keepUnusedDataFor: 0,
    }),
    getDailyStats: builder.query({
      query: (sessionId) => ({
        url: `/orders/daily-sales/${sessionId}`,
        method: 'GET',
      }),
      refetchOnMountOrArgChange: true, // ensures fresh stats on mount
    }),
    getAllOrders: builder.query({
      query: () => ({
        url: `/orders`,
        method: 'GET',
      }),
      providesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetOrdersBySessionQuery,
  useGetDailyStatsQuery,
  useGetAllOrdersQuery
} = ordersAPI;
