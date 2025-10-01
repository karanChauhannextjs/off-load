import React from "react";

export interface SwitchPropsType {
  defaultChecked?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  value?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClick?: () => void;
}
