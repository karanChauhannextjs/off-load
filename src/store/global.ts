import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

import {IResultResponse, NonFunctionKeys, Status, SuccessResponse} from '@models/index.ts';
import {createFeedback, createReport, getOffloadsCount, getSpecialities} from '@api/global.ts';
import {IBodyFeedback, IBodyReport, ISpeciality} from '@models/global.ts';

interface Store {
  getSpecialities: () => Promise<IResultResponse<ISpeciality[]>>;
  specialities: ISpeciality[];
  getSpecialitiesStatus: Status;

  getOffloadsCount: () => Promise<IResultResponse<any>>;
  offloadsCount: number;
  getOffloadsCountStatus: Status;

  createFeedback: (body:IBodyFeedback) => Promise<SuccessResponse>;
  createFeedbackStatus : Status

  createReport: (body:IBodyReport) => Promise<SuccessResponse>;
  createReportStatus : Status

  reset: () => void;
}

const initialState: Record<NonFunctionKeys<Store>, any> = {
  specialities: [],

  offloadsCount : null,

  getSpecialitiesStatus: 'IDLE',

  getOffloadsCountStatus: 'IDLE',

  createFeedbackStatus: 'IDLE',

  createReportStatus:'IDLE'
};
export const useGlobalStore = create(
  immer<Store>((set) => ({
    ...initialState,
    getSpecialities: async () => {
      try {
        set({ getSpecialitiesStatus: 'LOADING' });
        const result = await getSpecialities();
        set({ specialities: result });
        set({ getSpecialitiesStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ getSpecialitiesStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getOffloadsCount: async () => {
      try {
        set({ getOffloadsCountStatus: 'LOADING' });
        const result = await getOffloadsCount();
        set({ offloadsCount: result });
        set({ getOffloadsCountStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ getOffloadsCountStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    createFeedback: async (body:IBodyFeedback) => {
      try {
        set({ createFeedbackStatus: 'LOADING' });
        const result = await createFeedback(body);
        set({ createFeedbackStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ createFeedbackStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    createReport: async (body:IBodyReport) => {
      try {
        set({ createReportStatus: 'LOADING' });
        const result = await createReport(body);
        set({ createReportStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ createReportStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    reset: () => set(initialState),
  })),
);
