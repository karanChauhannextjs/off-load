import axios from "@config/axios.ts";
import {IResultResponse} from "@models/index.ts";
import {ICreateGoogleCode} from "@models/google.ts";

export const googleCode = async (params: ICreateGoogleCode) => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/google/code`,
    params,
  );
  return response.data.result;
};

export const googleDisconnect = async () => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/google/disconnect`,
    {}
  );
  return response.data;
};