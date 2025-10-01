import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

import { NonFunctionKeys, Status, SuccessResponse } from '@models/index.ts';
import { connectStripe, createIntent } from '@api/stripe.ts';
import { ICreateStripeIntent } from '@models/stripe.ts';

interface Store {
  connectStripe: (code: number | string) => Promise<SuccessResponse>;
  connectStripeStatus: Status;

  createIntent: (body: ICreateStripeIntent) => Promise<any>;
  createIntentStatus: Status;
  clientSecret: string
  paymentIntentId:string
}

const initialState: Record<NonFunctionKeys<Store>, any> = {
  connectStripeStatus: 'IDLE',

  createIntentStatus: 'IDLE',

  clientSecret: '',
  paymentIntentId:''
};
export const useStripeStore = create(
  immer<Store>((set) => ({
    ...initialState,
    connectStripe: async (code: string | number) => {
      try {
        set({ connectStripeStatus: 'LOADING' });
        const result = await connectStripe(code);
        set({ connectStripeStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ connectStripeStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    createIntent: async (body: ICreateStripeIntent) => {
      try {
        set({ createIntentStatus: 'LOADING' });
        const result = await createIntent(body);
        set({ clientSecret: result.clientSecret });
        set({ paymentIntentId: result.paymentIntentId });
        set({ createIntentStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ createIntentStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
  })),
);
