export interface IParamsLogin {
  email: string;
  password: string;
  timeZoneOffset?: number;
}

export interface IParamsRegister {
  name?: string;
  username?: string;
  email: string;
  password: string;
  type: number;
  agreeUpdates?: boolean
}

export interface IParamCheckCode {
  code: number;
}

export interface IBodyForgotPassword {
  email: string;
}

export interface IBodyResendCode {
  email: string;
}

export interface IBodySetPassword {
  code: string;
  password: string;
}

export interface ITherapistSignupForm {
  username: string;
  email: string;
  password: string;
  type?: number;
  agreeUpdates?: boolean
}

export interface IClientSignupForm {
  name: string;
  email: string;
  password: string;
  type?: number;
}

export interface IForgotForm {
  email: string;
}

export interface ISetPasswordForm {
  new_password: string;
  repeat_password: string;
}

export interface IOnboardingForm {
  name: string;
}
