import axios from '@config/axios.ts';
import { IResultResponse, SuccessResponse } from '@models/index.ts';
import {
  IBodyBioVideos, IBodyShareControl,
  IBodyUpdateProfile,
  IBodyUpdateSettings,
  IProfile,
} from '@models/profile.ts';

export const getProfile = async () => {
  const response = await axios.get<IResultResponse<IProfile>>(`/user`, {});
  return response.data;
};

export const getTherapistData = async (username:string) => {
  const url = `/view/therapist?username=${username}`;
  const response = await axios.get<IResultResponse<IProfile>>(url, {});
  return response.data;
};

export const updateProfile = async (params: IBodyUpdateProfile) => {
  const response = await axios.put<IResultResponse<IProfile>>(`/user`, params);
  return response.data.result;
};

export const uploadProfilePicture = async (file: File) => {
  const response = await axios.post<IResultResponse<SuccessResponse>>(
    `/user/image`,
    { image: file },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
};

export const uploadProfileBioImages = async (
  body: FormData,
  isNew: boolean,
) => {
  const url = isNew ? '/user/bio/images?isNew=1' : '/user/bio/images';
  const response = await axios.post<IResultResponse<SuccessResponse>>(
    url,
    body,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
};

export const uploadProfileBioVideos = async (params: IBodyBioVideos) => {
  const response = await axios.post<IResultResponse<SuccessResponse>>(
    `/user/bio/videos`,
    params,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
};

export const updateSettings = async (params: IBodyUpdateSettings) => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/update-settings`,
    params,
  );
  return response.data.result;
};

export const shareClientOffloads = async (params: IBodyShareControl) => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/share-offloads`,
    params,
  );
  return response.data.result;
};
