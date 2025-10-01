export interface ClientConnectModalProps {
  step: number;
  onNext: () => void;
  setCode?: any
  isWrongCode?: boolean
}