import React from 'react';
import { IProfile } from '@models/profile.ts';

export interface BookingEditCardProps {
  className?: string;
  type: 'session' | 'consultation';
  onChange: (newValue: any) => void;
  value?: any;
  data?: IProfile;
  setChanged?:any;
  setIsError?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ISessionItem {
  showActive: boolean
  isActive: boolean;
  isInPerson: boolean;
  isLiveText: boolean;
  isVideoCall: boolean;
  isVoiceCall: boolean;
  price: number | string | null | undefined;
  priceCurrency: string | null;
  type: number;
  uuid: string;
}

export interface IBookingEditCardErrors {
  consultationError?: string;
  min30TypeError?: string;
  durationError?: string;
  min30PriceError?: string;
  min50TypeError?: string;
  min50PriceError?: string;
  paymentError?: string;
  addressError?: string;
}
