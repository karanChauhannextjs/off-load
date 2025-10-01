import { ReactNode } from 'react';

export interface OptionType {
  label: string | ReactNode;
  value: string | number;
}

export interface SelectProps {
  value: OptionType | undefined | null;
  onChange: (value: OptionType) => void;
  data: OptionType[];
  className?: string;
  activeClassName?: string;
  renderItem?: (
    item: OptionType,
    index: number,
    data: OptionType[],
  ) => ReactNode;
  defaultValue?: OptionType | boolean;
  openDropdown?: boolean;
  firstAsDefault?: boolean;
  disabled?: boolean;
  isSearchable?: boolean;
  errorMessage?: string;
  placeholder?: string;
  withoutArrow?: boolean;
}
