import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

import { NonFunctionKeys, Status, SuccessResponse } from '@models/index.ts';
import {
  createExerciseAnswer, exerciseView,
  favoriteExercise,
  getClientJoinedExercises,
  getExercise,
  getExercises, getExercisesByCategory,
  getFavoriteExercises, getGroupCategories, getGroups, getJoinedExercises,
  getTherapistJoinedExercises,
  joinExercise,
  unFavoriteExercise, unJoinExercise,
} from '@api/exercises.ts';
import {ICreateExerciseAnswer} from '@models/exercise.ts';

interface Store {
  favoriteExercise: (uuid: string) => Promise<SuccessResponse>;
  favoriteExerciseStatus: Status;

  unFavoriteExercise: (uuid: string) => Promise<SuccessResponse>;
  unFavoriteExerciseStatus: Status;

  getExercise: (uuid: string) => Promise<SuccessResponse>;
  exercise: any;
  getExerciseStatus: Status;

  getExercises: (clientUuid?:string) => Promise<SuccessResponse>;
  exercises: any[];
  getExercisesStatus: Status;

  getExercisesByCategory: (type: number, filter: number) => Promise<SuccessResponse>;
  getExercisesByCategoryStatus: Status;

  getFavoriteExercises: (clientUuid?:string) => Promise<SuccessResponse>;
  favoriteExercises: any[];
  getFavoriteExercisesStatus: Status;

  getClientJoinedExercises: (uuid: string) => Promise<SuccessResponse>;
  joinedClientExercises: any[];
  getClientJoinedExercisesStatus: Status;

  getTherapistJoinedExercises: (clientEmail: string) => Promise<SuccessResponse>;
  joinedTherapistExercises: any[];
  getTherapistJoinedExercisesStatus: Status;

  getJoinedExercises: () => Promise<SuccessResponse>;
  joinedExercises: any[];
  getJoinedExercisesStatus: Status;

  createExerciseAnswer: (
    body: ICreateExerciseAnswer,
  ) => Promise<SuccessResponse>;
  createExerciseAnswerStatus: Status;

  joinExercise: (body: any, uuid: string) => Promise<SuccessResponse>;
  joinExerciseStatus: Status;

  unJoinExercise: (body: any, uuid: string) => Promise<SuccessResponse>;
  unJoinExerciseStatus: Status;

  viewExercise: (uuid: string) => Promise<SuccessResponse>;
  viewExerciseStatus: Status;

  getGroups: () => Promise<SuccessResponse>;
  groups: any[];
  getGroupsStatus: Status;

  getGroupCategories: (groupUuid: string, type: number) => Promise<SuccessResponse>;
  groupCategories: any[];
  getGroupCategoriesStatus: Status;

  resetGroups: () => void;

  reset: () => void;
}

const initialState: Record<NonFunctionKeys<Store>, any> = {
  exercise: null,

  exercises: null,

  groups: [],

  groupCategories: null,

  favoriteExercises: null,

  joinedExercises: null,

  joinedClientExercises: null,

  joinedTherapistExercises: null,

  favoriteExerciseStatus: 'IDLE',

  unFavoriteExerciseStatus: 'IDLE',

  getExerciseStatus: 'IDLE',

  getExercisesStatus: 'IDLE',

  getFavoriteExercisesStatus: 'IDLE',

  getClientJoinedExercisesStatus: 'IDLE',

  getTherapistJoinedExercisesStatus: 'IDLE',

  createExerciseAnswerStatus: 'IDLE',

  joinExerciseStatus: 'IDLE',

  getJoinedExercisesStatus: 'IDLE',

  unJoinExerciseStatus: 'IDLE',

  getExercisesByCategoryStatus: 'IDLE',

  viewExerciseStatus: 'IDLE',

  getGroupsStatus: 'IDLE',

  getGroupCategoriesStatus: 'IDLE',
};
export const useExercises = create(
  immer<Store>((set) => ({
    ...initialState,
    favoriteExercise: async (uuid) => {
      try {
        set({ favoriteExerciseStatus: 'LOADING' });
        const result = await favoriteExercise(uuid);
        set({ favoriteExerciseStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ favoriteExerciseStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    unFavoriteExercise: async (uuid) => {
      try {
        set({ unFavoriteExerciseStatus: 'LOADING' });
        const result = await unFavoriteExercise(uuid);
        set({ unFavoriteExerciseStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ unFavoriteExerciseStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getExercise: async (uuid) => {
      try {
        set({ getExerciseStatus: 'LOADING' });
        const result = await getExercise(uuid);
        set({ getExerciseStatus: 'SUCCESS' });
        set({ exercise: result });
        return result;
      } catch (e) {
        set({ getExerciseStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getExercises: async (clientUuid) => {
      try {
        set({ getExercisesStatus: 'LOADING' });
        const result = await getExercises(clientUuid);
        set({ getExercisesStatus: 'SUCCESS' });
        set({ exercises: result });
        return result;
      } catch (e) {
        set({ getExercisesStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getExercisesByCategory: async (type, filter) => {
      try {
        set({ getExercisesByCategoryStatus: 'LOADING' });
        const result = await getExercisesByCategory(type, filter);
        set({ getExercisesByCategoryStatus: 'SUCCESS' });
        set({ exercises: result });
        return result;
      } catch (e) {
        set({ getExercisesByCategoryStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getFavoriteExercises: async (clientUuid) => {
      try {
        set({ getFavoriteExercisesStatus: 'LOADING' });
        const result = await getFavoriteExercises(clientUuid);
        set({ getFavoriteExercisesStatus: 'SUCCESS' });
        set({ favoriteExercises: result });
        return result;
      } catch (e) {
        set({ getFavoriteExercisesStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getClientJoinedExercises: async (uuid) => {
      try {
        set({ getClientJoinedExercisesStatus: 'LOADING' });
        const result = await getClientJoinedExercises(uuid);
        set({ getClientJoinedExercisesStatus: 'SUCCESS' });
        set({ joinedClientExercises: result });
        return result;
      } catch (e) {
        set({ getClientJoinedExercisesStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getTherapistJoinedExercises: async (clientEmail) => {
      try {
        set({ getTherapistJoinedExercisesStatus: 'LOADING' });
        const result = await getTherapistJoinedExercises(clientEmail);
        set({ getTherapistJoinedExercisesStatus: 'SUCCESS' });
        set({ joinedTherapistExercises: result });
        return result;
      } catch (e) {
        set({ getTherapistJoinedExercisesStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getJoinedExercises: async () => {
      try {
        set({ getJoinedExercisesStatus: 'LOADING' });
        const result = await getJoinedExercises();
        set({ getJoinedExercisesStatus: 'SUCCESS' });
        set({ joinedExercises: result });
        return result;
      } catch (e) {
        set({ getJoinedExercisesStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    createExerciseAnswer: async (body) => {
      try {
        set({ createExerciseAnswerStatus: 'LOADING' });
        const result = await createExerciseAnswer(body);
        set({ createExerciseAnswerStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ createExerciseAnswerStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    joinExercise: async (body, uuid) => {
      try {
        set({ joinExerciseStatus: 'LOADING' });
        const result = await joinExercise(body, uuid);
        set({ joinExerciseStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ joinExerciseStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    unJoinExercise: async (body, uuid) => {
      try {
        set({ unJoinExerciseStatus: 'LOADING' });
        const result = await unJoinExercise(body, uuid);
        set({ unJoinExerciseStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ unJoinExerciseStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    viewExercise: async (uuid) => {
      try {
        set({ viewExerciseStatus: 'LOADING' });
        const result = await exerciseView(uuid);
        set({ viewExerciseStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ viewExerciseStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getGroups: async () => {
      try {
        set({ getGroupsStatus: 'LOADING' });
        const result = await getGroups();
        set({ getGroupsStatus: 'SUCCESS' });
        set({ groups: result });
        return result;
      } catch (e) {
        set({ getGroupsStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getGroupCategories: async (groupUuid, type) => {
      try {
        set({ getGroupCategoriesStatus: 'LOADING' });
        const result = await getGroupCategories(groupUuid, type);
        set({ getGroupCategoriesStatus: 'SUCCESS' });
        set({ groupCategories: result });
        return result;
      } catch (e) {
        set({ getGroupCategoriesStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    resetGroups: () => {
      set({ groups: [], getGroupsStatus: 'IDLE' });
    },
    reset: () => {
      set(initialState);
    },
  })),
);
