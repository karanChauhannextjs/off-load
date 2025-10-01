import React from "react";

export interface ReportModalProps {
  modalHandlers?: any;
  setReportShow?: React.Dispatch<React.SetStateAction<boolean>>;
}

export enum REPORT_MODAL_FIELDS {
  EMAIL = 'email',
  TEXT = 'text',
}
