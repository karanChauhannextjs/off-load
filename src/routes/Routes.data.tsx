import { lazy } from 'react';
import { RoutesEnum } from '@routes/Routes.types.ts';

//User Public
const Login = lazy(() => import('@pages/Login'));
const ClientSignUp = lazy(() => import('@pages/ClientSignUp'));
const TherapistSignUp = lazy(() => import('@pages/TherapistSignUp'));
const ForgotPassword = lazy(() => import('@pages/ForgotPassword'));
const Verification = lazy(() => import('@pages/Verification'));
const ResetPassword = lazy(() => import('@pages/ResetPassword'));
const Onboarding = lazy(() => import('@pages/Onboarding'));

//Therapist Private
const TherapistHome = lazy(() => import('@pages/TherapistHome'));
const MyPage = lazy(() => import('@pages/MyPage'));
const EditPage = lazy(() => import('@pages/EditPage'));
const Care = lazy(() => import('@pages/Care'));
const SharedClients = lazy(() => import('@pages/SharedClients'));
const Schedule = lazy(() => import('@pages/Schedule'));
const Clients = lazy(() => import('@pages/Clients'));
const Availability = lazy(() => import('@pages/Availability'));
const Account = lazy(() => import('@pages/Account'));
const Transactions = lazy(() => import('@pages/Transactions'));
const Plan = lazy(() => import('@pages/Plan'));

//Client Private
const ClientHome = lazy(() => import('@pages/ClientHome'));
const ClientMessages = lazy(() => import('@pages/ClientMessages'));
const ClientAccount = lazy(() => import('@pages/ClientAccount'));
const Feed = lazy(() => import('@pages/Feed'));

//View Private
const View = lazy(() => import('@pages/View'));
const ViewSession = lazy(() => import('@pages/ViewSession'));

export const publicRoutes = [
  { Component: Care, path: RoutesEnum.CARE },
  { Component: SharedClients, path: RoutesEnum.CLIENTS },
  { Component: ClientHome, path: RoutesEnum.CLIENT_HOME },
  { Component: ClientSignUp, path: RoutesEnum.CLIENT_SIGN_UP },
]

export const userPublicRoutes = [
  { Component: Login, path: RoutesEnum.LOGIN },
  { Component: ClientSignUp, path: RoutesEnum.CLIENT_SIGN_UP },
  { Component: TherapistSignUp, path: RoutesEnum.THERAPIST_SIGN_UP },
  { Component: ForgotPassword, path: RoutesEnum.FORGOT_PASSWORD },
  { Component: Verification, path: RoutesEnum.VERIFICATION },
  { Component: ResetPassword, path: RoutesEnum.RESET_PASSWORD },
  { Component: Onboarding, path: RoutesEnum.ONBOARDING },
];

export const therapistPrivateRoutes = [
  { Component: TherapistHome, path: RoutesEnum.THERAPIST_HOME },
  { Component: MyPage, path: RoutesEnum.MY_PAGE },
  { Component: EditPage, path: RoutesEnum.EDIT_PAGE },
  { Component: Care, path: RoutesEnum.CARE },
  { Component: SharedClients, path: RoutesEnum.CLIENTS },
  { Component: Schedule, path: RoutesEnum.SCHEDULE },
  { Component: Clients, path: RoutesEnum.INBOX },
  { Component: Availability, path: RoutesEnum.AVAILABILITY },
  { Component: Account, path: RoutesEnum.ACCOUNT },
  { Component: Transactions, path: RoutesEnum.TRANSACTIONS },
  { Component: Plan, path: RoutesEnum.PLAN },
];

export const clientPrivateRoutes = [
  { Component: ClientHome, path: RoutesEnum.CLIENT_HOME },
  { Component: ClientMessages, path: RoutesEnum.CLIENT_MESSAGES },
  { Component: Care, path: RoutesEnum.CARE },
  { Component: Feed, path: RoutesEnum.FEED },
  { Component: ClientAccount, path: RoutesEnum.CLIENT_ACCOUNT },
];

export const viewPublicRoutes = [
  { Component: View, path: RoutesEnum.VIEW },
  { Component: ViewSession, path: RoutesEnum.VIEW_SESSION },
];

