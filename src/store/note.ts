import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

import { NonFunctionKeys, Status, SuccessResponse } from '@models/index.ts';
import { ICreateNote } from '@models/note.ts';
import {createNote, deleteNote, editNote, getNotes} from '@api/note.ts';

interface Store {
  createNote: (body: ICreateNote, uuid: string) => Promise<SuccessResponse>;
  createNoteStatus: Status;

  getNotes: (uuid: string) => Promise<SuccessResponse>;
  notes: any;
  getNotesStatus: Status;

  editNote: (body: ICreateNote, id: number) => Promise<SuccessResponse>;
  editNoteStatus: Status;

  deleteNote: (id: number) => Promise<SuccessResponse>;
  deleteNoteStatus: Status;

  reset: () => void;
}

const initialState: Record<NonFunctionKeys<Store>, any> = {
  notes: [],

  createNoteStatus: 'IDLE',

  editNoteStatus: 'IDLE',

  deleteNoteStatus: 'IDLE',

  getNotesStatus: 'IDLE',
};
export const useNote = create(
  immer<Store>((set) => ({
    ...initialState,
    createNote: async (body, uuid) => {
      try {
        set({ createNoteStatus: 'LOADING' });
        const result = await createNote(body, uuid);
        set({ createNoteStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ createNoteStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    getNotes: async (uuid) => {
      try {
        set({ getNotesStatus: 'LOADING' });
        const result = await getNotes(uuid);
        set({ getNotesStatus: 'SUCCESS' });
        set({ notes: result });
        return result;
      } catch (e) {
        set({ getNotesStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    editNote: async (body, id) => {
      try {
        set({ editNoteStatus: 'LOADING' });
        const result = await editNote(body, id);
        set({ editNoteStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ editNoteStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    deleteNote: async ( id) => {
      try {
        set({ deleteNoteStatus: 'LOADING' });
        const result = await deleteNote(id);
        set({ deleteNoteStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ deleteNoteStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    reset: () => {
      set(initialState);
    },
  })),
);
