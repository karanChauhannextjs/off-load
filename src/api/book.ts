import axios from '@config/axios.ts';
import { IResultResponse, SuccessResponse } from '@models/index.ts';
import {IBodyBook, IBodyCheckBooking, IBodyEditBook, ICancelBook} from '@models/book.ts';

export const createBook = async (params: IBodyBook) => {
  const response = await axios.post<IResultResponse<any>>(
    `/book`,
    params,
  );
  return response.data.result;
};

export const getBookings = async () => {
  const response = await axios.get(`/user/bookings`);
  return response.data.result;
};

export const cancelBooking = async (params: ICancelBook) => {
  const response = await axios.post<IResultResponse<SuccessResponse>>(
    `/book/cancel`,
    params,
  );
  return response.data.result;
};

export const editBook = async (params: IBodyEditBook) => {
  const response = await axios.post<IResultResponse<SuccessResponse>>(
      `/book/edit`,
      params,
  );
  return response.data.result;
};

export const therapistCheckBooking = async (params: IBodyCheckBooking) => {
  const response = await axios.post<IResultResponse<SuccessResponse>>(
    `/user/therapist/check-booking`,
    params,
  );
  return response.data.result;
};