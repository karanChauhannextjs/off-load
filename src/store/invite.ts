import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

import { NonFunctionKeys, Status, SuccessResponse } from '@models/index.ts';
import {
  checkTherapistInvites,
  connectClient,
  getTherapistInviteClient,
  inviteClient,
} from '@api/invite.ts';
import { IBodyConnectClient, IBodyInviteClient } from '@models/invite.ts';

interface Store {
  inviteClient: (body: IBodyInviteClient) => Promise<SuccessResponse>;
  inviteClientStatus: Status;

  connectClient: (params: IBodyConnectClient) => Promise<any>;
  connectClientStatus: Status;

  getTherapistInviteClient: (from:number, count: number) => Promise<SuccessResponse>;
  therapistInviteClient: any;
  getTherapistInviteClientStatus: Status;

  checkTherapistInvites: () => Promise<any>;
  therapistInvites: any;
  checkTherapistInvitesStatus: Status;
}

const initialState: Record<NonFunctionKeys<Store>, any> = {
  therapistInviteClient: null,

  therapistInvites: null,

  inviteClientStatus: 'IDLE',

  connectClientStatus: 'IDLE',

  checkTherapistInvitesStatus: 'IDLE',

  getTherapistInviteClientStatus: 'IDLE',
};
export const useInvite = create(
  immer<Store>((set) => ({
    ...initialState,
    inviteClient: async (body: IBodyInviteClient) => {
      try {
        set({ inviteClientStatus: 'LOADING' });
        const result = await inviteClient(body);
        set({ inviteClientStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ inviteClientStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    connectClient: async (body: IBodyConnectClient) => {
      try {
        set({ connectClientStatus: 'LOADING' });
        const result = await connectClient(body);
        set({ connectClientStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ connectClientStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getTherapistInviteClient: async (from, count) => {
      try {
        set({ getTherapistInviteClientStatus: 'LOADING' });
        const result = await getTherapistInviteClient(from, count);
        set({ getTherapistInviteClientStatus: 'SUCCESS' });
        set({ therapistInviteClient: result });
        return result;
      } catch (e) {
        set({ getTherapistInviteClientStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    checkTherapistInvites: async () => {
      try {
        set({ checkTherapistInvitesStatus: 'LOADING' });
        const result = await checkTherapistInvites();
        set({ checkTherapistInvitesStatus: 'SUCCESS' });
        set({ checkTherapistInvites: result });
        return result;
      } catch (e) {
        set({ checkTherapistInvitesStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
  })),
);
