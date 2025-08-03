import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const registerAPI = createApi({
  reducerPath: 'registerAPI',
  baseQuery: fetchBaseQuery({ baseUrl: '/manager/register' }),
  endpoints: (builder) => ({
    fetchSessions: builder.query({
      query: ({ start, end, manager }) => {
        const params = new URLSearchParams();
        if (start) params.append('startDate', start.toISOString());
        if (end) params.append('endDate', end.toISOString());
        if (manager && manager !== 'ALL') params.append('manager', manager);
        return `sessions?${params.toString()}`;
      }
    }),
    getSessionById: builder.query({
      query: (id) => `sessions/${id}`
    })
  })
});

export const { useFetchSessionsQuery, useGetSessionByIdQuery } = registerAPI;
