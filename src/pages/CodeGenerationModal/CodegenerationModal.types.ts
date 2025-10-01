import { IProfile } from '@models/profile.ts';

export interface CodeGenerationModalProps {
  setCodeGenerationShow: any;
  page: 'inbox' | 'clients';
  data: IProfile;
}

export enum CODE_GENERATION_FIELDS {
  NAME = 'name',
  EMAIL = 'email',
}
