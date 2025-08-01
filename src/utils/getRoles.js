import {axiosPrivate} from '@/api/axios'; // your axiosPrivate setup

const getRoles = async () => {
  try {
    const response = await axiosPrivate.get('/roles'); // secured endpoint
    return response.data; // array of roles [{ _id, name }]
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    return [];
  }
};

export default getRoles;