import React from "react";

export interface CanceledBookingModalProps {
  data: any;
  show?: boolean;
  setShow?: React.Dispatch<React.SetStateAction<boolean>>;
  onClickDone:()=>void
}
