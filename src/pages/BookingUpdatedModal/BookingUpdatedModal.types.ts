import React from "react";

export interface BookingUpdatedModalProps {
  data?: any;
  setShowBookingUpdated: React.Dispatch<React.SetStateAction<boolean>>;
  setThreeModalsShow?:React.Dispatch<React.SetStateAction<boolean>>
}