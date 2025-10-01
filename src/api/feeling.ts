import axios from '@config/axios.ts';
import { IResultResponse } from '@models/index.ts';
import { IFeelingBody } from '@models/global.ts';

export const getCauses = async () => {
  const response = await axios.get<IResultResponse<any>>(`/user/causes`);
  return response.data.result;
};

export const userFeeling = async (params: IFeelingBody) => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/feeling`,
    params,
  );
  return response.data.result;
};

export const getClientFeed = async (start: number, end: number) => {
  const response = await axios.get<IResultResponse<any>>(
    `/user/client/feed?start=${start}&end=${end}`,
  );
  return response.data.result;
};

export const getTherapistFeed = async (uuid: string, start: number, end: number) => {
  const response = await axios.get<IResultResponse<any>>(
    `/user/therapist/feed/${uuid}?start=${start}&end=${end}`,
  );
  return response.data.result;
};

export const getDemoClientFeed = async (start: number, end: number, type: number) => {
  const response = await axios.get<IResultResponse<any>>(
    `/user/demo-client/feed?start=${start}&end=${end}&type=${type}`,
  );
  return response.data.result;
};
