import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import {
  Status,
  IResultResponse,
  NonFunctionKeys,
  SuccessResponse,
} from '@models/index.ts';

import {
  ITime,
  IBodyTheWorkHour,
  IBodyOverrideHour,
  IOverrideData,
} from '@models/availability.ts';
import {
  overrideHours,
  getOverrideHours,
  deleteOverrideHour,
  updateOverrideHour,
  getTherapistWorkHours,
  createTherapistWorkHour,
  deleteTherapistWorkHour,
  updateTherapistWorkHour,
  getTherapistAvailability,
} from '@api/availability.ts';

interface Store {
  getTherapistWorkHours: (
    start: number,
    end: number,
    type: number,
  ) => Promise<IResultResponse<any>>;
  weekData: any;
  getAvailabilityStatus: Status;

  createTherapistWorkHour: (body: IBodyTheWorkHour) => Promise<SuccessResponse>;
  createTherapistWorkHourStatus: Status;

  updateTherapistWorkHour: (body: ITime) => Promise<SuccessResponse>;
  updateTherapistWorkHourStatus: Status;

  deleteTherapistWorkHour: (
    rangeUUID: string,
    dayUUID?: string,
  ) => Promise<SuccessResponse>;
  deleteTherapistWorkHourStatus: Status;

  getOverrideHours: (
    start: number,
    end: number,
  ) => Promise<IResultResponse<any>>;
  overridedData: IOverrideData[];
  getOverrideHoursStatus: Status;

  overrideHour: (body: IBodyOverrideHour) => Promise<SuccessResponse>;
  overrideHourStatus: Status;

  updateOverrideHour: (body: ITime) => Promise<SuccessResponse>;
  updateOverrideHourStatus: Status;

  deleteOverrideHour: (
    rangeUUID: string,
    dayUUID?: string,
  ) => Promise<SuccessResponse>;
  deleteOverrideHourStatus: Status;

  getTherapistAvailability: (
    username: string,
    start: number,
    end: number,
  ) => Promise<IResultResponse<any>>;
  therapistAvailability: any;
  getTherapistAvailabilityStatus: Status;

  reset: () => void;
}

const initialState: Record<NonFunctionKeys<Store>, any> = {
  weekData: null,
  getAvailabilityStatus: 'IDLE',

  createTherapistWorkHourStatus: 'IDLE',

  updateTherapistWorkHourStatus: 'IDLE',

  deleteTherapistWorkHourStatus: 'IDLE',

  overridedData: null,

  getOverrideHoursStatus: 'IDLE',

  overrideHourStatus: 'IDLE',

  updateOverrideHourStatus: 'IDLE',

  deleteOverrideHourStatus: 'IDLE',

  therapistAvailability: null,

  getTherapistAvailabilityStatus: 'IDLE'
};

export const useAvailability = create(
  immer<Store>((set) => ({
    ...initialState,
    getTherapistWorkHours: async (start: number, end: number, type: number) => {
      try {
        set({ getAvailabilityStatus: 'LOADING' });
        const result = await getTherapistWorkHours(start, end, type);
        set({ weekData: result.result });
        set({ getAvailabilityStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ getAvailabilityStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    createTherapistWorkHour: async (body: IBodyTheWorkHour) => {
      try {
        set({ createTherapistWorkHourStatus: 'LOADING' });
        const result = await createTherapistWorkHour(body);
        set({ createTherapistWorkHourStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ createTherapistWorkHourStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    updateTherapistWorkHour: async (body: ITime) => {
      try {
        set({ updateTherapistWorkHourStatus: 'LOADING' });
        const result = await updateTherapistWorkHour(body);
        set({ updateTherapistWorkHourStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ updateTherapistWorkHourStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    deleteTherapistWorkHour: async (rangeUUID: string, dayUUID?: string) => {
      try {
        set({ deleteTherapistWorkHourStatus: 'LOADING' });
        const result = await deleteTherapistWorkHour(rangeUUID, dayUUID);
        set({ deleteTherapistWorkHourStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ deleteTherapistWorkHourStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getOverrideHours: async (start: number, end: number) => {
      try {
        set({ getOverrideHoursStatus: 'LOADING' });
        const result = await getOverrideHours(start, end);
        set({ overridedData: result.result });
        set({ getOverrideHoursStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ getOverrideHoursStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    overrideHour: async (body: IBodyOverrideHour) => {
      try {
        set({ overrideHourStatus: 'LOADING' });
        const result = await overrideHours(body);
        set({ overrideHourStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ overrideHourStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    updateOverrideHour: async (body: ITime) => {
      try {
        set({ updateOverrideHourStatus: 'LOADING' });
        const result = await updateOverrideHour(body);
        set({ updateOverrideHourStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ updateOverrideHourStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    deleteOverrideHour: async (rangeUUID: string, dayUUID?: string) => {
      try {
        set({ deleteOverrideHourStatus: 'LOADING' });
        const result = await deleteOverrideHour(rangeUUID, dayUUID);
        set({ deleteOverrideHourStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ deleteOverrideHourStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getTherapistAvailability: async (username: string, start: number, end: number) => {
      try {
        set({ getAvailabilityStatus: 'LOADING' });
        const result = await getTherapistAvailability(username,start, end);
        set({ therapistAvailability: result.result });
        set({ getAvailabilityStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ getAvailabilityStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    reset: () => {
      set(initialState);
    },
  })),
);
