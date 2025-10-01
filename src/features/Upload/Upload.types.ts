import React from 'react';

export interface UploadProps {
  className?: string;
  accept?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
