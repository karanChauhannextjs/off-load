import React from "react";

export interface FeedbackModalProps {
  modalHandlers?: any;
  setFeedbackShow?: React.Dispatch<React.SetStateAction<boolean>>;
}

export enum FEEDBACK_MODAL_FIELDS {
  EMAIL = 'email',
  TEXT = 'text',
}
