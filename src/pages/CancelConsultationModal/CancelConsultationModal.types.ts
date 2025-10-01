import {IScheduleCard} from "@models/book.ts";
import React from "react";

export interface CancelConsultationModalModalProps {
  data?: IScheduleCard;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setThreeModalsShow?: React.Dispatch<React.SetStateAction<boolean>>;
}
