export enum RoutesEnum {
  LOGIN = 'login',
  THERAPIST_SIGN_UP = 'therapist-sign-up',
  CLIENT_SIGN_UP = 'client-sign-up',
  VERIFICATION = 'verification',
  FORGOT_PASSWORD = 'forgot-password',
  RESET_PASSWORD = 'reset-password',
  ONBOARDING = 'onboarding',

  THERAPIST_HOME = 'therapist-home',
  MY_PAGE = 'my-page',
  EDIT_PAGE = 'edit-page',
  CARE = 'care',
  CLIENTS = 'shared-clients',
  SCHEDULE = 'schedule',
  AVAILABILITY = 'availability',
  INBOX = 'clients',
  ACCOUNT = 'account',
  TRANSACTIONS = 'account/transactions',
  PLAN = 'account/plan',

  CLIENT_HOME = 'client-home',
  CLIENT_MESSAGES = 'client-messages',
  CLIENT_ACCOUNT = 'client-account',
  FEED = 'feed',

  VIEW = '/:username',
  VIEW_SESSION = '/:username/sessions',
}

export const USER_PUBLIC_URL = '/public';
export const USER_PUBLIC_BASE_URL = '/auth';
export const THERAPIST_PRIVATE_BASE_URL = '/therapist';
export const CLIENT_PRIVATE_BASE_URL = '/client';
export const VIEW_PUBLIC_BASE_URL = '/';
export const EXERCISE_PUBLIC_BASE_URL = '/exercise';
export const CHECKIN_PUBLIC_BASE_URL = '/checkin';
export const CALL_BASE_URL = '/call';
export const CONNECT_STRIPE  = '/stripe/-connect-stripe';
export const CONNECT_GOOGLE  = '/google/-connect-google';
export const PLANS_AND_BILLINGS  = '/plans-and-billings';
export const SUBSCRIPTION_STATUS  = '/subscription-status';
