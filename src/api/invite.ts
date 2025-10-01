import axios from '@config/axios.ts';
import { IResultResponse } from '@models/index.ts';
import {IBodyConnectClient, IBodyInviteClient} from '@models/invite.ts';

export const inviteClient = async (params: IBodyInviteClient) => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/invite-client`,
    params,
  );
  return response.data;
};

export const connectClient = async (params: IBodyConnectClient) => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/client/connect-therapist`,
    params,
  );
  return response.data;
};

export const getTherapistInviteClient = async (from: number, count:number) => {
  const response = await axios.get<any>(
    `/user/therapist/invite-client?from=${from}&count=${count}`,
    {},
  );
  return response.data.result;
};

export const checkTherapistInvites = async () => {
  const response = await axios.get<any>(
    `/user/therapist/check-invites`,
    {},
  );
  return response.data.result;
};
