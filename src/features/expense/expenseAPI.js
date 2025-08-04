// services/expensesAPI.js
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/api/axiosBaseQuery';

export const expensesAPI = createApi({
  reducerPath: 'expensesAPI',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Expenses'],
  endpoints: (builder) => ({
    getExpensesBySession: builder.query({
      query: (sessionId) => ({
        url: `/expenses/session/${sessionId}`,
        method: 'GET',
        withCredentials: true
      }),
      providesTags: (result, error, sessionId) =>
        result ? [{ type: 'Expenses', id: sessionId }] : [],
    }),
  }),
});

export const { useGetExpensesBySessionQuery } = expensesAPI;
