import axios from '@config/axios.ts';

export const getChatRefreshToken = async () => {
  const response = await axios.get(`/user/refresh-agora-token`);
  return response.data.result;
};

export const getConversations = async (
  from: number,
  count: number,
  type?: number,
) => {
  const url = type
    ? `/user/conversations?from=${from}&count=${count}&type=${type}`
    : `/user/conversations?from=${from}&count=${count}`;
  const response = await axios.get(url);
  return response.data.result.data;
};

export const createConversation = async (body: any) => {
  const response = await axios.post(`/user/conversation/create`, body);
  return response.data.result;
};

export const updateConversation = async (body: any) => {
  const response = await axios.post(`/user/conversation/update`, body);
  return response.data.result;
};

export const removeConversation = async (id: number) => {
  const response = await axios.delete(`/user/conversation/${id}`);
  return response.data.result;
};

export const removeClientsConversation = async (id: number) => {
  const response = await axios.delete(`/user/clients-conversation/${id}`);
  return response.data.result;
};

// export const getTherapistClientsConversations = async (
//   from: number,
//   count: number,
// ) => {
//   const response = await axios.get(
//     `/user/therapist/clients-conversations?from=${from}&count=${count}`,
//   );
//   return response.data.result.data;
// };
