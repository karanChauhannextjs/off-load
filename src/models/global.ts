export interface ISpeciality {
  id: number;
  uuid: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
}

export interface ICustomSpeciality {
  id: number;
  uuid: string;
  name: string;
  isSelected: boolean;
}

export interface IBodyFeedback {
  email?: string;
  text: string;
}

export interface IBodyReport {
  email: string;
  text: string;
}

export interface ICause {
  id: number;
  uuid: string;
  name: string;
  order: number
}

export interface IFeelingBody {
  note:string
  feeling:string | number
  date:string
  causes:number[]
}