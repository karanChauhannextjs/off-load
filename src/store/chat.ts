import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

import {
  IResultResponse,
  NonFunctionKeys,
  Status,
  SuccessResponse,
} from '@models/index.ts';
import {
  createConversation,
  getChatRefreshToken,
  getConversations,
  // getTherapistClientsConversations,
  removeClientsConversation,
  removeConversation,
  updateConversation,
} from '@api/chat.ts';

interface Store {
  getConversations: (
    from: number,
    count: number,
    type?: number,
  ) => Promise<IResultResponse<any[]>>;
  conversations: any[];
  getConversationsStatus: Status;

  // getTherapistClientsConversations: (
  //   from: number,
  //   count: number,
  // ) => Promise<IResultResponse<any[]>>;
  // getTherapistClientsConversationsStatus: Status;
  therapistClientsConversations: any[];

  createConversation: (body: any) => Promise<SuccessResponse>;
  createConversationStatus: Status;

  updateConversation: (body: any) => Promise<SuccessResponse>;
  updateConversationStatus: Status;

  getAgoraRefreshToken: () => Promise<SuccessResponse>;
  getAgoraRefreshTokenStatus: Status;
  agoraRefreshToken: string;

  removeConversation: (id: number) => Promise<SuccessResponse>;
  removeConversationStatus: Status;

  removeClientsConversation: (id: number) => Promise<SuccessResponse>;
  removeClientsConversationStatus: Status;

}

const initialState: Record<NonFunctionKeys<Store>, any> = {
  conversations: [],

  therapistClientsConversations: [],

  agoraRefreshToken: '',

  getConversationsStatus: 'IDLE',

  createConversationStatus: 'IDLE',

  updateConversationStatus: 'IDLE',

  getAgoraRefreshTokenStatus: 'IDLE',

  removeConversationStatus: 'IDLE',

  removeClientsConversationStatus: 'IDLE',

  // getTherapistClientsConversationsStatus: 'IDLE',
};
export const useConversation = create(
  immer<Store>((set) => ({
    ...initialState,
    getConversations: async (from: number, count: number, type?: number) => {
      try {
        set({ getConversationsStatus: 'LOADING' });
        const result = await getConversations(from, count, type);
        if(type === 2){
          set({ therapistClientsConversations: result });
        }else{
          set({ conversations: result });
        }
        set({ getConversationsStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ getConversationsStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    // getTherapistClientsConversations: async (from: number, count: number) => {
    //   try {
    //     set({ getTherapistClientsConversationsStatus: 'LOADING' });
    //     const result = await getTherapistClientsConversations(from, count);
    //     set({ therapistClientsConversations: result });
    //     set({ getTherapistClientsConversationsStatus: 'SUCCESS' });
    //     return result;
    //   } catch (e) {
    //     set({ getTherapistClientsConversationsStatus: 'FAIL' });
    //     return Promise.reject(e);
    //   }
    // },
    createConversation: async (body: any) => {
      try {
        set({ createConversationStatus: 'LOADING' });
        const result = await createConversation(body);
        set({ createConversationStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ createConversationStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    updateConversation: async (body: any) => {
      try {
        set({ updateConversationStatus: 'LOADING' });
        const result = await updateConversation(body);
        set({ updateConversationStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ updateConversationStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getAgoraRefreshToken: async () => {
      try {
        set({ getAgoraRefreshTokenStatus: 'LOADING' });
        const result = await getChatRefreshToken();
        set({ agoraRefreshToken: result });
        set({ getAgoraRefreshTokenStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ getAgoraRefreshTokenStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    removeConversation: async (id: number) => {
      try {
        set({ removeConversationStatus: 'LOADING' });
        const result = await removeConversation(id);
        set({ agoraRefreshToken: result });
        set({ removeConversationStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ removeConversationStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    removeClientsConversation: async (id: number) => {
      try {
        set({ removeClientsConversationStatus: 'LOADING' });
        const result = await removeClientsConversation(id);
        set({ agoraRefreshToken: result });
        set({ removeClientsConversationStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ removeClientsConversationStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
  })),
);
