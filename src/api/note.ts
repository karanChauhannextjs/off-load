import axios from '@config/axios.ts';
import { IResultResponse } from '@models/index.ts';
import { ICreateNote } from '@models/note.ts';

export const createNote = async (params: ICreateNote, uuid: string) => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/add-note/${uuid}`,
    params,
  );
  return response.data.result;
};

export const getNotes = async (uuid: string) => {
  const response = await axios.get<IResultResponse<any>>(
    `/user/get-notes/${uuid}`,
    {},
  );
  return response.data.result;
};

export const editNote = async (params: ICreateNote, id: number) => {
  const response = await axios.put<IResultResponse<any>>(
    `/user/edit-note/${id}`,
    params,
  );
  return response.data.result;
};

export const deleteNote = async (id: number) => {
  const response = await axios.delete<IResultResponse<any>>(
    `/user/delete-note/${id}`,{}
  );
  return response.data.result;
};
