import { BadgeProps } from '@shared/ui/Badge/Badge.types.ts';

export interface BadgeSliderProps {
  className?: string;
  data: BadgeProps[];
  isActiveId?: number | string;
  isAvailabilityId?: number[];
  showItemsNumber: number;
  variant?: 'primary' | 'secondary';
  onClickItem?: (id: number | string) => void;
  isChanged?:boolean
}
