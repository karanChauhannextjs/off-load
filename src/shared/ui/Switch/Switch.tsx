import React, {forwardRef} from 'react';
import cn from 'classnames';

import { SwitchPropsType } from '@shared/ui/Switch/Switch.types.ts';
import styles from './Switch.module.scss';

const Switch: React.ForwardRefRenderFunction<
  HTMLInputElement,
  SwitchPropsType
> = (props,ref) => {
  const { className, label, onChange, onClick, value, defaultChecked, ...rest } = props;

  return (
    <label onClick={onClick} className={cn(styles.switchContainer, className)}>
      <input type="checkbox" defaultChecked={defaultChecked} checked={value} onChange={onChange} ref={ref} {...rest} />
      <i className={cn(styles.slider)} />
      <span className={styles.label}>{label}</span>
    </label>
  );
};

export default forwardRef(Switch);
