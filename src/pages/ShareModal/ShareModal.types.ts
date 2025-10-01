import React from "react";

export interface ShareModalProps {
  link: string;
  setShareShow?: React.Dispatch<React.SetStateAction<boolean>>;
}
