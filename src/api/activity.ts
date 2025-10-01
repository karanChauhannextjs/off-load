import axios from '@config/axios.ts';

export const getTherapistActivity = async (from: number, count: number) => {
  const response = await axios.get(`/user/client/activity?from=${from}&count=${count}`, {});
  return response.data.result;
};
