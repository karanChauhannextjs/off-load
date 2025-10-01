export interface AvailabilityTabsProps {
  className?: string;
  onClick: (id: number) => void;
  tabsData: IAvailabilityTab[];
  isActiveTab: number;
}

export interface IAvailabilityTab {
  id: number;
  label: string;
  classname: string;
}
