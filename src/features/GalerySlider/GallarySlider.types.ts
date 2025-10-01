import { IUserImagesData, IUserVideoData } from '@models/profile.ts';

export interface GallarySliderProps {
  className?: string;
  video?: IUserVideoData[];
  images?: IUserImagesData[];
  onPlayVideo?: () => void;
}
