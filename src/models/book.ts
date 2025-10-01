import { IProfile } from '@models/profile.ts';

export interface IBodyBook {
  email: string;
  name: string;
  note: string;
  type: number;
  date: number;
  isVideoCall: boolean;
  isInPerson: boolean;
  isVoiceCall: boolean;
  isLiveText: boolean;
  therapistUuid: string;
}

export interface ICancelBook {
  id?: number;
}

export interface IBodyCheckBooking {
  name: string;
  email: string;
}

export interface IBodyEditBook {
  id: number;
  type: number;
  date: number;
  isVideoCall: boolean;
  isInPerson: boolean;
  isVoiceCall: boolean;
  isLiveText: boolean;
  dateGMT: string;
}

export interface IScheduleCard {
  id: number;
  day: string;
  email: string;
  name: string;
  note?: string;
  type: number;
  date: number;
  endTime: string;
  startTime: string;
  isVideoCall: boolean;
  isInPerson: boolean;
  isLiveText: boolean;
  isVoiceCall: boolean;
  channelName: string;
  bookingLink?:string;
  isInvited: boolean;
  isConversationCreated?: boolean;
  creator: IProfile;
  therapist: IProfile;
}

export interface IBookData {
  day: number;
  time: number;
  duration?: number;
  type: string;
}
