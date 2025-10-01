import { ICustomSpeciality, ISpeciality } from '@models/global.ts';
import { ISessionItem } from '@widgets/BookingEditCard/BookingEditCard.types.ts';

export interface IProfile {
  email: string;
  agoraChatToken: string;
  agoraUserUuid: string;
  agoraUsername: string;
  name: string;
  username: string;
  address: string;
  token: string;
  uuid: string;
  type: number;
  image: string;
  createdAt: string;
  location?: string;
  lastLogin: string;
  verified?: boolean;
  profession?: string;
  shortBio?: string;
  fullBio?: string;
  instagramLink: string;
  isInstagramLinkActive: boolean;
  linkedinLink: string;
  isLinkedinLinkActive: boolean;
  tiktokLink: string;
  isTiktokLinkActive: boolean;
  twitterLink: string;
  isTwitterLinkActive: boolean;
  stripeAccountId: string;
  isGoogleCalendarConnected?: boolean;
  acceptedCounts: number;
  inviteCounts: number;
  generalInviteCounts: number;
  isSubscribed: boolean;
  paidStatus: number;
  paymentTerm: number;
  stripeSubscriptionId: number;
  stripeSubscriptionPeriodEnd: number;
  stripeSubscriptionPeriodStart: number;
  educations?: IEducationsData[];
  memberships?: IMembershipsData[];
  specialities: ISpeciality[];
  userVideos: IUserVideoData[];
  userImages?: IUserImagesData[];
  userSessions?: ISessionItem[];
  customSpecialities: ICustomSpeciality[];
}

export interface IBodyUpdateProfile {
  email?: string;
  name?: string;
  username?: string;
  address?: string;
  location?: string;
  instagramLink?: string;
  isInstagramLinkActive?: boolean;
  linkedinLink?: string;
  isLinkedinLinkActive?: boolean;
  tiktokLink?: string;
  isTiktokLinkActive?: boolean;
  twitterLink?: string;
  isTwitterLinkActive?: boolean;
  profession?: string;
  shortBio?: string;
  specialities?: number[];
  fullBio?: string;
  memberships?: string[];
  educations?: string[];
  deleteVideos?: number[];
  deleteImages?: (number | undefined)[];
  isGoogleCalendarConnected?: boolean;
  userSessions?: any[];
  customSpecialities?: IBodyNewSpeciality[];
}

export interface IBodyUpdateSettings {
  name?: string;
  isEnabledNewMessages?: boolean;
  isEnabledSessionReminders?: boolean;
  isEnabledSessionReschedules?: boolean;
}

export interface IBodyNewSpeciality {
  id?: number;
  name?: string;
  isSelected?: boolean;
}

export interface IBodyBioVideos {
  video: File;
}

export interface IMembershipsData {
  id: number;
  name: string;
}

export interface IEducationsData {
  id: number;
  name: string;
}

export interface IUserVideoData {
  id: number;
  thumbnail: string;
  video: string;
}

export interface IUserImagesData {
  id: number;
  image: string;
  order: number;
}

export interface IBodyShareControl {
  therapistUuid: string;
  shareOffloads: number;
}
