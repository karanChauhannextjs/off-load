import axios from '@config/axios.ts';
import { IResultResponse, SuccessResponse } from '@models/index.ts';
import {
  IBodyOverrideHour,
  IBodyTheWorkHour,
  ITime,
} from '@models/availability.ts';

export const createTherapistWorkHour = async (params: IBodyTheWorkHour) => {
  const response = await axios.post<IResultResponse<SuccessResponse>>(
    `/user/working-hour`,
    params,
  );
  return response.data.result;
};

export const getTherapistWorkHours = async (
  start: number,
  end: number,
  type: number,
) => {
  const response = await axios.get<IResultResponse<any>>(
    `/user/working-hours?start=${start}&end=${end}&type=${type}`,
  );
  return response.data;
};

export const updateTherapistWorkHour = async (params: ITime) => {
  const response = await axios.put<IResultResponse<SuccessResponse>>(
    `/user/working-hour`,
    params,
  );
  return response.data.result;
};

export const deleteTherapistWorkHour = async (
  rangeUUID: string,
  dayUUID?: string,
) => {
  const url = !!dayUUID
    ? `/user/working-hour?dayUUID=${dayUUID}`
    : `/user/working-hour?rangeUUID=${rangeUUID}`;

  const response = await axios.delete<IResultResponse<SuccessResponse>>(url);
  return response.data.result;
};

export const overrideHours = async (params: IBodyOverrideHour) => {
  const response = await axios.post<IResultResponse<SuccessResponse>>(
    `/user/override-hour`,
    params,
  );
  return response.data.result;
};

export const getOverrideHours = async (start: number, end: number) => {
  const response = await axios.get<IResultResponse<any>>(
    `/user/override-hours?start=${start}&end=${end}`,
  );
  return response.data;
};

export const updateOverrideHour = async (params: ITime) => {
  const response = await axios.put<IResultResponse<SuccessResponse>>(
    `/user/override-hour`,
    params,
  );
  return response.data.result;
};

export const deleteOverrideHour = async (
  rangeUUID: string,
  dayUUID?: string,
) => {
  const url = !!dayUUID
    ? `/user/override-hour?dayUUID=${dayUUID}`
    : `/user/override-hour?rangeUUID=${rangeUUID}`;

  const response = await axios.delete<IResultResponse<SuccessResponse>>(url);
  return response.data.result;
};

export const getTherapistAvailability = async (username: string, start: number, end: number) => {
  const response = await axios.get<IResultResponse<any>>(
      `/user/therapist-availability/${username}?start=${start}&end=${end}`,
  );
  return response.data;
};