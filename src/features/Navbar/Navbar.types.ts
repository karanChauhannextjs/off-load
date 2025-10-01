export interface NavbarProps {
  className?: string;
  onClickItem: (id: number, path: string) => void;
  isOldAccount?: boolean
}
