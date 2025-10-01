import { IScheduleCard } from '@models/book.ts';
import React from "react";

export interface StartBookingModalProps {
  data: IScheduleCard;
  setThreeModalsShow?: React.Dispatch<React.SetStateAction<boolean>>;
}
