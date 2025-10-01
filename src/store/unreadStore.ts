import { create } from 'zustand';
export const useUnreadStore = create((set) => ({
  newMessages: false,
  newMessagesClients: false,
  setNewMessagesState: (value:any) => set({ newMessages: value }),
  setNewMessagesClientsState: (value:any) => set({ newMessagesClients: value }),
}));