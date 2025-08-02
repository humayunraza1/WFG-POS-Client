import { axiosPrivate } from '@/api/axios'

export default function useStats() {
  async function getEmployeeStats(period = 'daily', startDate = null, endDate = null, isActive = true) {
    const params = new URLSearchParams();

    if (period) params.append('period', period);
    if (startDate && endDate) {
      params.append('startDate', startDate);
      params.append('endDate', endDate);
    }
    if (isActive) params.append('isOpen', isActive);

    const endpoint = `/stats/?${params.toString()}`;

    const res = await axiosPrivate.get(endpoint);
    console.log(res)
    return res.data; // Let caller handle the data
  }

  return getEmployeeStats;
}
