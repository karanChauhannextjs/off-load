export interface ScheduleCardType {
  id: number | string;
  day: string;
  month: string;
  isActive: boolean;
  sessions: SessionsType[];
  img?: string;
}

export interface SessionsType {
  id: number | string;
  firstName: string;
  lastName: string;
  session_type: 'session' | 'consultation';
  start_time: string;
  end_time: string;
  price?: string;
  type: 'live-text' | 'in-person' | 'voice-call' | 'video-call';
  disabled: boolean;
}
