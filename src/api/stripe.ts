import axios from '@config/axios.ts';
import { IResultResponse } from '@models/index.ts';
import { ICreateStripeIntent } from '@models/stripe.ts';
import { IProfile } from '@models/profile.ts';

export const connectStripe = async (code: number | string) => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/connect-stripe?code=${code}`,
    {},
  );
  return response.data.result;
};

export const createIntent = async (params: ICreateStripeIntent) => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/create-intent`,
    params,
  );
  return response.data.result;
};

export const getSubscriptionPlans = async () => {
  const response = await axios.get<IResultResponse<IProfile>>(
    `/settings/stripe-subscription-plans`,
    {},
  );
  return response.data;
};

export const getPortalLink = async () => {
  const response = await axios.get<IResultResponse<IProfile>>(
    `/user/stripe/subscription/portal/link`,
    {},
  );
  return response.data;
};

export const createSubscription = async (params: any) => {
  const response = await axios.post<IResultResponse<any>>(
    `/user/stripe/subscription/payment/link`,
    params,
  );
  return response.data.result;
};
