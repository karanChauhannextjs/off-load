export interface BannerProps {
  className?: string;
  variant?: 'primary' | 'secondary';
  firstLabel?: string;
  secondLabel: string;
  withButtons?: boolean;
  firstButtonIcon?: string;
  secondButtonIcon?: string;
  firstButtonLabel?: string;
  secondButtonLabel?: string;
  firstButtonDisabled?: boolean;
  secondButtonDisabled?: boolean;
  firstButtonLoading?: boolean;
  secondButtonLoading?: boolean;
  firstButtonVariant?: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
  secondButtonVariant?: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
  handlerFirstButton?: () => void;
  handlerSecondButton?: () => void;
}
