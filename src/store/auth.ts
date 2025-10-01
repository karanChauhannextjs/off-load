import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';
import {
  IBodyForgotPassword,
  IBodyResendCode,
  IBodySetPassword,
  IParamCheckCode,
  IParamsLogin,
  IParamsRegister,
} from '@models/auth.ts';
import { IProfile } from '@models/profile.ts';
import { NonFunctionKeys, Status, SuccessResponse} from '@models/index.ts';
import {
  checkCode,
  confirm,
  forgotPassword,
  login,
  registration,
  resendCode,
  setPassword,
} from '@api/auth.ts';

interface Store {
  login: (params: IParamsLogin) => Promise<IProfile>;
  loginStatus: Status;

  registration: (params: IParamsRegister) => Promise<SuccessResponse>;
  registrationStatus: Status;

  confirm: (params: IParamCheckCode) => Promise<IProfile>;
  confirmStatus: Status;

  user: IProfile;

  forgotPassword: (params: IBodyForgotPassword) => Promise<SuccessResponse>;
  forgotPasswordStatus: Status;

  checkCode: (params: IParamCheckCode) => Promise<SuccessResponse>;
  checkCodeStatus: Status;

  setPassword: (params: IBodySetPassword) => Promise<IProfile>;
  setPasswordStatus: Status;

  resendCode: (params: IBodyResendCode) => Promise<SuccessResponse>;
  resendCodeStatus: Status;

  reset: () => void;
}

const initialState: Record<NonFunctionKeys<Store>, any> = {
  user: null,

  loginStatus: 'IDLE',

  registrationStatus: 'IDLE',

  confirmStatus: 'IDLE',

  forgotPasswordStatus: 'IDLE',

  checkCodeStatus: 'IDLE',

  setPasswordStatus: 'IDLE',

  resendCodeStatus: 'IDLE',
};

export const useUserAuthStore = create(
  immer<Store>((set) => ({
    ...initialState,
    login: async (params: IParamsLogin) => {
      try {
        set({ loginStatus: 'LOADING' });
        const result = await login(params);
        set({ user: result });
        set({ loginStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ loginStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    registration: async (params: IParamsRegister) => {
      try {
        set({ registrationStatus: 'LOADING' });
        const result = await registration(params);
        set({ registrationStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ registrationStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    confirm: async (params: IParamCheckCode) => {
      try {
        set({ confirmStatus: 'LOADING' });
        const result = await confirm(params);
        set({ confirmStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ confirmStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    forgotPassword: async (params: IBodyForgotPassword) => {
      try {
        set({ forgotPasswordStatus: 'LOADING' });
        const result = await forgotPassword(params);
        set({ forgotPasswordStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ forgotPasswordStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    checkCode: async (params: IParamCheckCode) => {
      try {
        set({ checkCodeStatus: 'LOADING' });
        const result = await checkCode(params);
        set({ checkCodeStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ checkCodeStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    setPassword: async (params: IBodySetPassword) => {
      try {
        set({ setPasswordStatus: 'LOADING' });
        const result = await setPassword(params);
        set({ setPasswordStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ setPasswordStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    resendCode: async (params: IBodyResendCode) => {
      try {
        set({ resendCodeStatus: 'LOADING' });
        const result = await resendCode(params);
        set({ resendCodeStatus: 'SUCCESS' });
        return result;
      } catch (e) {
        set({ resendCodeStatus: 'FAIL' });
        return Promise.reject(e);
      }
    },
    reset: () => {
      set(initialState);
    },
  })),
);
