import { SESSION_TYPE } from '@constants/constants.ts';

export interface BookingCardProps {
  className?: string;
  onClickBook?: (data?: any) => void;
  type: string;
  data?: any;
  show?: boolean;
  onChangeRadio?: () => void;
  username?: string;
  buttonDisabled?: boolean;
  onClickCard?: () => void;
}

export interface BookingCardDataTypes {
  session_type: 'session' | 'consultation';
  session_types: SESSION_TYPE[];
}
