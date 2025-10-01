import React from 'react';
import { IScheduleCard } from '@models/book.ts';

export interface ClientStartBookingModalProps {
  data: IScheduleCard;
  setThreeModalsShow?: React.Dispatch<React.SetStateAction<boolean>>;
}
