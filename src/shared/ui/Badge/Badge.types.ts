export interface BadgeProps {
  id: number;
  className?: string;
  icon?: string;
  label?: string;
  price?: number | string;
  secondLabel?: string;
  isActive?: boolean;
  readonly?: boolean;
  isAvailability?: boolean;
  variant?: 'primary' | 'secondary';
  onClick?: (id?: number | string, label?: string) => void;
}
