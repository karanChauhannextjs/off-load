import React from 'react';
import cn from 'classnames';

import styles from './Button.module.scss';
import { ButtonProps } from './Button.types.ts';

const Button: React.FC<ButtonProps> = (props) => {
  const {
    label,
    onClick,
    className,
    variant = 'primary',
    disabled,
    buttonRef,
    type = 'button',
    icon,
    iconClassName,
    fullWidth,
    isLoading,
  } = props;

  if (!label && !icon) {
    return null;
  }

  return (
    <button
      className={cn(styles.base, styles[variant], className, {
        [styles.disabled]: disabled || isLoading,
        [styles.fullWidth]: fullWidth,
      })}
      onClick={onClick}
      ref={buttonRef}
      type={type}
    >
      {isLoading ? (
        <div className={styles.loader} />
      ) : (
        <>
          {!!icon && (
            <i className={cn(`icon-${icon}`, styles.icon, iconClassName)} />
          )}
          {label}
        </>
      )}
    </button>
  );
};

export default Button;
