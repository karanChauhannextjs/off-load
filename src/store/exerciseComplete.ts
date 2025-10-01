import { create } from 'zustand';

export const useExerciseComplete = create((set) => ({
  exerciseUsers: null,
  setExerciseUsersData: (value: any) => set({ exerciseUsers: value }),
  reset: () => set({ exerciseUsers: null }),
}));
