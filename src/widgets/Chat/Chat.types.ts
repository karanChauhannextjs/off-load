import { IScheduleCard } from '@models/book.ts';
import { IProfile } from '@models/profile.ts';

export interface ChatProps {
  conversations?: any;
  bookingsData?: IScheduleCard[];
  user?: any;
  onAddClick?: (client?: IProfile) => void;
  onConnectClick?: (therapist?: IProfile) => void;
  isMobileScreen?: any;
  onClickCard?: (item?: any) => void;
  page?: string;
}

export interface IConversation {
  id: number;
  client: IProfile;
  therapist: IProfile;
  createdAt: string;
  lastUpdate: string;
  email: string;
}

export const inboxTabs = [
  { id: 1, label: 'Messages' },
  { id: 2, label: 'Bookings' },
];

export const clientsTabs = [
  { id: 1, label: 'Feed' },
  { id: 2, label: 'Care' },
  { id: 3, label: 'Messages' },
  { id: 4, label: 'Bookings' },
  { id: 5, label: 'Notes' },
]

export const clientChatTabs = [
  { id: 1, label: 'Messages' },
  { id: 2, label: 'Care plan' },
  { id: 3, label: 'View profile' },
];

export const signoutTabs = [
  { id: 1, label: 'Feed' },
  { id: 2, label: 'Care' },
  { id: 3, label: 'Messages' },
  { id: 4, label: 'Notes' },
]