import React from 'react';

export interface CheckboxProps {
  className?: string;
  checked?: boolean;
  label?: string;
  variant?: 'primary' | 'secondary';
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
