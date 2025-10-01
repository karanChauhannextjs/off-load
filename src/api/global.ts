import axios from '@config/axios.ts';
import { IBodyFeedback, IBodyReport } from '@models/global.ts';
import { IResultResponse, SuccessResponse } from '@models/index.ts';

export const getSpecialities = async () => {
  const response = await axios.get(`/user/specialities`);
  return response.data.result;
};

export const createFeedback = async (params: IBodyFeedback) => {
  const response = await axios.post<SuccessResponse>(
    `/user/feedback`,
    params,
  );
  return response.data;
};

export const createReport = async (params: IBodyReport) => {
  const response = await axios.post<IResultResponse<SuccessResponse>>(
    `/user/report`,
    params,
  );
  return response.data.result;
};

export const getOffloadsCount = async () => {
  const response = await axios.get(`/user/offloads-count`);
  return response.data.result;
};