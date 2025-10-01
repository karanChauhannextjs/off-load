import { PropsWithChildren } from 'react';

export interface AppModalProps extends PropsWithChildren {
  className?: string;
  metaData?: any;
  isVisible: boolean;
  closeIcon?: boolean;
  width: string | number;
  withBorder?: boolean;
  disableClosingModal?: boolean;
  onClose: (metaData?: any) => void;
  setStateAction?: any
}
