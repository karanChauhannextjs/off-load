import { OptionType } from '@shared/ui/Select';

export interface IBodyTheWorkHour {
  type: number;
  weekDay: number;
  start: string;
  end: string;
}

export interface IBodyTheWorkHours {
  type: number;
  weekDay: number;
  ranges: ITime[];
  uuid: string;
}

export interface ITime {
  start: string;
  end: string;
  uuid: string;
}

export interface ITimeControl {
  start: OptionType;
  end: OptionType;
}

export interface IBodyOverrideHour {
  date: number;
  start: string;
  end: string;
}

export interface IResult {
  monday?: IResultItem[];
  tuesday?: IResultItem[];
  wednesday?: IResultItem[];
  thursday?: IResultItem[];
  friday?: IResultItem[];
  saturday?: IResultItem[];
  sunday?: IResultItem[];
}

export interface IResultItem {
  start: OptionType;
  end: OptionType;
  uuid: string;
  dayUUID: string;
}

export interface IOverrideData {
  id: number;
  uuid: string;
  date: number;
  createdAt: string;
  ranges: IResultItem[];
}

export interface ITimeItem{
  id: number;
  label: string;
}