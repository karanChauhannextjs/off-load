import axios from "@config/axios.ts";

export const getCallToken = async (channelName: string) => {
  const response = await axios.get(`/user/generate-call-token?channelName=${channelName}`);
  return response.data;
};
