export enum EDIT_PAGE_FORM_FIELDS {
  NAME = 'name',
  LOCATION = 'location',
  LINKEDIN = 'linkedinLink',
  INSTAGRAM = 'instagramLink',
  TWITTER = 'twitterLink',
  TIKTOK = 'tiktokLink',
  PROFESSION = 'profession',
  SHORT_BIO = 'shortBio',
  NEW_SPECIALITY = 'new_speciality',
  FULL_BIO = 'fullBio',
  EDUCATION_ACCREDITATIONS = 'educations',
  MEMBERSHIPS = 'memberships',
  SESSION = 'session',
  CONSULTATION = 'consultation',
}

export interface SocialLinkType {
  id: number;
  name: string;
  icon?: string;
  link?: string;
  fieldName?: 'LINKEDIN' | 'INSTAGRAM' | 'TWITTER' | 'TIKTOK';
  isActive?: boolean;
  isChecked?: boolean;
  placeholder?: string;
}

export interface IUploadBlock {
  id: number;
  type: string;
  imageSrc: string;
  file: File | null;
  uploaded: boolean;
}
