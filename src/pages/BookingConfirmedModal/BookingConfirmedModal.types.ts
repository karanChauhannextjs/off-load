import React from "react";

export interface BookingConfirmedModalProps {
  data?: any;
  setShowBookingConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
  setBookModalShow?: React.Dispatch<React.SetStateAction<boolean>>;
  setShowBookingPayment?: React.Dispatch<React.SetStateAction<boolean>>;
}