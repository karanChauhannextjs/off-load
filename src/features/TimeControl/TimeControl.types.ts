import { OptionType } from '@shared/ui/Select';

export interface TimeControlProps {
  day?: string;
  value?: any;
  type?: number;
  weekDay?: number;
  remove: () => void;
  lastItem?: boolean;
  onChange: (option: OptionType) => void;
  startSelectData?: OptionType[];
  nextStartIdx?: any;
}
