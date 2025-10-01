import React from "react";

export interface BookingPaymentModalProps {
  setShowBookingPayment?: React.Dispatch<React.SetStateAction<boolean>>;
  setBookModalShow?: React.Dispatch<React.SetStateAction<boolean>>;
  data?: any;
}

export enum BOOKING_PAYMENT_MODAL_FIELDS {
  CARD_NAME = 'card_name',
  CARD_NUMBER = 'card_number',
  EXPIRY_DATE = 'expiry_date',
  SECURITY_CODE = 'security_code',
}
