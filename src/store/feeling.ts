import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

import {
  IResultResponse,
  NonFunctionKeys,
  Status,
  SuccessResponse,
} from '@models/index.ts';
import {
  getCauses,
  getClientFeed,
  getDemoClientFeed,
  getTherapistFeed,
  userFeeling,
} from '@api/feeling.ts';
import { IFeelingBody } from '@models/global.ts';

interface Store {
  userFeeling: (body: IFeelingBody) => Promise<SuccessResponse>;
  userFeelingStatus: Status;

  getCauses: () => Promise<IResultResponse<any>>;
  causes: any;
  getCausesStatus: Status;

  getClientFeed: (start: number, end: number) => Promise<IResultResponse<any>>;
  clientFeed: any;
  getClientFeedStatus: Status;

  getTherapistFeed: (uuid: string, start: number, end: number) => Promise<IResultResponse<any>>;
  therapistFeed: any;
  getTherapistFeedStatus: Status;

  getDemoClientFeed: (start: number, end: number, type: number,) => Promise<IResultResponse<any>>;
  demoClientFeed: any;
  getDemoClientFeedStatus: Status;

  reset: () => void;
}

const initialState: Record<NonFunctionKeys<Store>, any> = {
  causes: null,

  clientFeed: null,

  therapistFeed: null,

  demoClientFeed: null,

  userFeelingStatus: 'IDLE',

  getCausesStatus: 'IDLE',

  getClientFeedStatus: 'IDLE',

  getTherapistFeedStatus: 'IDLE',

  getDemoClientFeedStatus: 'IDLE',
};
export const useFeeling = create(
  immer<Store>((set) => ({
    ...initialState,
    userFeeling: async (body) => {
      try {
        set({ userFeelingStatus: 'LOADING' });
        const result = await userFeeling(body);
        set({ userFeelingStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ userFeelingStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getCauses: async () => {
      try {
        set({ getCausesStatus: 'LOADING' });
        const result = await getCauses();
        set({ getCausesStatus: 'SUCCESS' });
        set({ causes: result });
        return result;
      } catch (e) {
        set({ getCausesStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getClientFeed: async (start, end) => {
      try {
        set({ getClientFeedStatus: 'LOADING' });
        const result = await getClientFeed(start, end);
        set({ getClientFeedStatus: 'SUCCESS' });
        set({ clientFeed: result });
        return result;
      } catch (e) {
        set({ getClientFeedStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getTherapistFeed: async (uuid: string, start, end) => {
      try {
        set({ getTherapistFeedStatus: 'LOADING' });
        const result = await getTherapistFeed(uuid, start, end);
        set({ getTherapistFeedStatus: 'SUCCESS' });
        set({ therapistFeed: result });
        return result;
      } catch (e) {
        set({ getTherapistFeedStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getDemoClientFeed: async (start, end, type) => {
      try {
        set({ getDemoClientFeedStatus: 'LOADING' });
        const result = await getDemoClientFeed(start, end, type);
        set({ getDemoClientFeedStatus: 'SUCCESS' });
        set({ demoClientFeed: result });
        return result;
      } catch (e) {
        set({ getDemoClientFeedStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    reset: () => set(initialState),
  })),
);
