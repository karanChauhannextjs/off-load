import React from 'react';

export interface TextareaProps
  extends React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > {
  value?: string;
  variant?: 'primary' | 'secondary';
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  resize?: boolean;
  errorMessage?: string;
}
