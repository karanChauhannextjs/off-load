import axios from "@config/axios.ts";

export const getTransactions = async (from:number, count: number) => {
  const response = await axios.get<any>(`/user/transactions?from=${from}&count=${count}`);
  return response.data.result;
};
