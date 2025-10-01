import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

import { NonFunctionKeys, Status } from '@models/index.ts';
import {getTransactions} from "@api/transactions.ts";

interface Store {
  getTransactions: (from: number, count: number) => Promise<any[]>;
  transactions: any;
  getTransactionsStatus: Status;
}

const initialState: Record<NonFunctionKeys<Store>, any> = {
  transactions: {},
  getTransactionsStatus: 'IDLE',
};
export const useTransactions = create(
  immer<Store>((set) => ({
    ...initialState,
    getTransactions: async (from, count) => {
      try {
        set({ getTransactionsStatus: 'LOADING' });
        const result = await getTransactions(from,count);
        set({ transactions: result });
        set({ getTransactionsStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ getTransactionsStatus: 'FAIL' });
        return Promise.reject(e);
      }
    }
  })),
);
