export interface ScheduleCardProps {
  className?: string;
  disabled?: boolean;
  name?: string;
  duration?: string;
  end_time: string;
  start_time: string;
  session_type: 'session' | 'consultation';
  type: 'live-text' | 'in-person' | 'voice-call' | 'video-call' | '';
  onClick?: () => void;
  day?: string;
  month?: string;
}
