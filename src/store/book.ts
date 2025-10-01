import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

import { NonFunctionKeys, Status, SuccessResponse } from '@models/index.ts';
import {IBodyBook, IBodyCheckBooking, IBodyEditBook, ICancelBook, IScheduleCard} from '@models/book.ts';
import {cancelBooking, createBook, editBook, getBookings, therapistCheckBooking} from '@api/book.ts';

interface Store {
  createBook: (body: IBodyBook) => Promise<SuccessResponse>;
  createBookStatus: Status;

  getBookings: () => Promise<SuccessResponse>;
  bookingData: IScheduleCard[];
  getBookingsStatus: Status;

  cancelBooking: (body:ICancelBook) => Promise<SuccessResponse>;
  cancelBookingStatus: Status;

  editBook: (body:IBodyEditBook) => Promise<SuccessResponse>;
  editBookStatus: Status;

  therapistCheckBooking: (body:IBodyCheckBooking) => Promise<SuccessResponse>;
  therapistCheckBookingStatus: Status;

  reset: () => void;
}

const initialState: Record<NonFunctionKeys<Store>, any> = {
  bookingData: null,

  createBookStatus: 'IDLE',

  getBookingsStatus: 'IDLE',

  cancelBookingStatus: 'IDLE',

  editBookStatus: 'IDLE',

  therapistCheckBookingStatus: 'IDLE'
};
export const useBook = create(
  immer<Store>((set) => ({
    ...initialState,
    createBook: async (body: IBodyBook) => {
      try {
        set({ createBookStatus: 'LOADING' });
        const result = await createBook(body);
        set({ createBookStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ createBookStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getBookings: async () => {
      try {
        set({ getBookingsStatus: 'LOADING' });
        const result = await getBookings();
        set({ bookingData: result });
        set({ getBookingsStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ getBookingsStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    cancelBooking: async (body: ICancelBook) => {
      try {
        set({ cancelBookingStatus: 'LOADING' });
        const result = await cancelBooking(body);
        set({ cancelBookingStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ cancelBookingStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    editBook: async (body: IBodyEditBook) => {
      try {
        set({ editBookStatus: 'LOADING' });
        const result = await editBook(body);
        set({ editBookStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ editBookStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    therapistCheckBooking: async (body: IBodyCheckBooking) => {
      try {
        set({ therapistCheckBookingStatus: 'LOADING' });
        const result = await therapistCheckBooking(body);
        set({ therapistCheckBookingStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ therapistCheckBookingStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    reset: () => set(initialState),
  })),
);
