import axios from '@config/axios.ts';
import { IProfile } from '@models/profile.ts';
import { IResultResponse, SuccessResponse } from '@models/index.ts';
import {
  IBodyForgotPassword,
  IBodyResendCode,
  IBodySetPassword,
  IParamCheckCode,
  IParamsLogin,
  IParamsRegister,
} from '@models/auth.ts';

export const login = async (params: IParamsLogin) => {
  const response = await axios.post<IResultResponse<IProfile>>(
    `/user/login`,
    params,
  );
  return response.data.result;
};

export const registration = async (params: IParamsRegister) => {
  const response = await axios.post<IResultResponse<SuccessResponse>>(`/user`, params);
  return response.data;
};

export const confirm = async (params: IParamCheckCode) => {
  const response = await axios.post<IResultResponse<IProfile>>(
    `/user/confirm`,
    params,
  );
  return response.data.result;
};

export const forgotPassword = async (params: IBodyForgotPassword) => {
  const response = await axios.post<IResultResponse<SuccessResponse>>(
    `/user/password/recover`,
    params,
  );
  return response.data;
};

export const checkCode = async (params: IParamCheckCode) => {
  const response = await axios.post<IResultResponse<IProfile>>(
    `/user/check-code`,
    params,
  );
  return response.data;
};

export const setPassword = async (params: IBodySetPassword) => {
  const response = await axios.post<IResultResponse<IProfile>>(
    `/user/password/confirm`,
    params,
  );
  return response.data.result;
};

export const resendCode = async (params: IBodyResendCode) => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/resend-confirmation`,
    params,
  );
  return response.data;
};
