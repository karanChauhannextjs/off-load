export interface ExerciseCardProps {
  withName?: boolean;
  withView?: boolean;
  cardData?: IExerciseCardData;
  className?: string;
  isAddable?: boolean;
  isShareable?: boolean;
  isDeletable?: boolean;
  isFavoritable?: boolean;
  isEmpty?: boolean;
  size?: 'small' | 'medium' | 'large';
  onActionClick?: (type: string, card: any) => void;
  onFavoriteClick?: (isFavorite: boolean, uuid: string, exercise?: any) => void;
  onCardClick?: (card: any) => void;
  onShare?: (exercise: any) => void;
}

export interface IExerciseCardData {
  name: string;
  uuid?: string;
  subtext?: string;
  tag?: string;
  id?: number;
  isFavorite?: boolean;
  isVideo?: boolean;
  url: string;
  image?: string;
  formattedViewCount: string,
  viewCount: number
}
