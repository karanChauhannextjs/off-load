import axios from '@config/axios.ts';
import { IResultResponse } from '@models/index.ts';
import { ICreateExerciseAnswer } from '@models/exercise.ts';

export const getExercise = async (uuid: string) => {
  const response = await axios.get(`/user/exercise/${uuid}`);
  return response.data.result;
};

export const getExercises = async (clientEmail?: string) => {
  const url = `/user/exercises`;
  const body = clientEmail ? { email: clientEmail } : {};
  const response = await axios.post(url, body);
  return response.data.result;
};

export const getFavoriteExercises = async (clientEmail?: string) => {
  const url = '/user/exercises-favorite';
  const body = clientEmail ? { email: clientEmail } : {};
  const response = await axios.post(url, body);
  return response.data.result;
};

export const favoriteExercise = async (uuid: string) => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/exercise/${uuid}/favorite`,
    {},
  );
  return response.data.result;
};

export const unFavoriteExercise = async (uuid: string) => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/exercise/${uuid}/unfavorite`,
    {},
  );
  return response.data.result;
};

export const getClientJoinedExercises = async (uuid: string) => {
  const response = await axios.get(`/user/client/joined-exercises/${uuid}`);
  return response.data.result;
};

export const getTherapistJoinedExercises = async (email: string) => {
  const response = await axios.post(`/user/therapist/joined-exercises`, {
    email,
  });
  return response.data.result;
};

export const getJoinedExercises = async () => {
  const response = await axios.get(`/user/joined-exercises`);
  return response.data.result;
};

export const createExerciseAnswer = async (params: ICreateExerciseAnswer) => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/exercise/answers`,
    params,
  );
  return response.data.result;
};

export const joinExercise = async (params: any, uuid: string) => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/join-exercise/${uuid}`,
    params,
  );
  return response.data.result;
};

export const unJoinExercise = async (params: any, uuid: string) => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/therapist/unjoin-exercise/${uuid}`,
    params,
  );
  return response.data.result;
};

export const getExercisesByCategory = async (type: number, filter: number) => {
  const response = await axios.get(`/user/category/exercises/${type}?filter=${filter}`);
  return response.data.result;
};

export const exerciseView = async (uuid: string) => {
  const response = await axios.post(`/user/view/exercise/${uuid}`, {});
  return response.data.result;
};

export const getGroups = async () => {
  const response = await axios.get(`/user/groups`);
  return response.data.result;
};

export const getGroupCategories = async (uuid: string, type: number) => {
  const response = await axios.get(
    `/user/group/categories/${type}?uuid=${uuid}`,
  );
  return response.data.result;
};
