import React, { forwardRef, useState } from 'react';
import cn from 'classnames';

import { CheckboxProps } from './Checkbox.types.ts';
import styles from './Checkbox.module.scss';

const Checkbox: React.ForwardRefRenderFunction<
  HTMLInputElement,
  CheckboxProps
> = (props, ref) => {
  const {
    className,
    onChange,
    checked,
    label,
    variant = 'primary',
    ...rest
  } = props;

  const [isChecked, setIsChecked] = useState(checked || false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (checked === undefined) {
      setIsChecked(e.target.checked);
    }
  };

  const isCheckboxChecked = checked !== undefined ? checked : isChecked;

  return (
    <label
      className={cn(styles.base, className, {
        [styles.secondary]: variant === 'secondary',
      })}
    >
      <input
        checked={checked}
        type="checkbox"
        onChange={handleChange}
        ref={ref}
        {...rest}
      />
      {variant === 'secondary' && isCheckboxChecked && (
        <span style={{position:'relative'}}>
          <i className={cn('icon-check', styles.checkIcon)} />
        </span>
      )}
      <span className={cn({ [styles.withMg]: !!label })}>{label}</span>
    </label>
  );
};

export default forwardRef(Checkbox);
