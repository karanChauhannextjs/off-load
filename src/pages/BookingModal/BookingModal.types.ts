import React from "react";

export interface BookingModalProps {
  setBookModalShow?: React.Dispatch<React.SetStateAction<boolean>>;
  data?: any;
}

export interface IBookingModalFields {
  name: string;
  email: string;
  note?: string;
}

export enum BOOKING_NOT_LOGIN_FIELDS {
  NAME = 'name',
  EMAIL = 'email',
  NOTE = 'note',
}
