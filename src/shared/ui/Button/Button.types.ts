import { RefObject } from 'react';

export interface ButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
  disabled?: boolean;
  buttonRef?: RefObject<HTMLButtonElement>;
  type?: 'submit' | 'button' | 'reset';
  icon?: string;
  iconClassName?: string;
  fullWidth?: boolean;
  isLoading?: boolean;
}
