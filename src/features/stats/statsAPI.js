// services/statsAPI.js
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/api/axiosBaseQuery';

export const statsAPI = createApi({
  reducerPath: 'statsAPI',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Stats'],
  endpoints: (builder) => ({
    // query accepts an object: { period, startDate, endDate, isActive }
    getEmployeeStats: builder.query({
      query: ({ period = 'daily', startDate = null, endDate = null, isActive = true } = {}) => {
        // Build query params
        const params = new URLSearchParams();
        if (period) params.append('period', period);
        if (startDate && endDate) {
          params.append('startDate', startDate);
          params.append('endDate', endDate);
        }
        if (typeof isActive !== 'undefined') params.append('isOpen', isActive);

        return {
          url: `/stats/?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Stats'],
      // optional: set to 0 if you don't want caching between mounts
      keepUnusedDataFor: 60,
      // optional: refetch on focus or reconnect
      refetchOnReconnect: true,
      refetchOnFocus: false,
    }),
  }),
});

export const { useGetEmployeeStatsQuery, useLazyGetEmployeeStatsQuery } = statsAPI;
export default statsAPI;
