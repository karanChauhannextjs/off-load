import React, { forwardRef, useState } from 'react';
import cn from 'classnames';

import { InputProps } from './Input.types.ts';
import styles from './Input.module.scss';

const Input: React.ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  props,
  ref,
) => {
  const {
    value,
    onChange,
    placeholder,
    className,
    disabled,
    errorMessage,
    variant = 'primary',
    type,
    ...rest
  } = props;

  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = !showPassword && isPassword ? 'password' : type === 'number' ? 'number' : 'text' ;
  const showIcon = isPassword;
  const passwordIconType = showPassword ? 'show' : 'hide';

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div
      tabIndex={1}
      className={cn(
        styles.wrapper,
        {
          [styles.error]: !!errorMessage,
          [styles.withIcon]: showIcon,
        },
        className,
      )}
    >
      <input
        className={cn(styles.base, styles[variant], {
          [styles.disabled]: disabled,
        })}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        type={inputType}
        ref={ref}
        {...rest}
      />
      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
      {showIcon && (
        <i
          className={cn(`icon-${passwordIconType}`, styles.icon)}
          onClick={handleShowPassword}
        />
      )}
    </div>
  );
};

export default forwardRef(Input);
