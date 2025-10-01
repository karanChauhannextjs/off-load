import React from 'react';
import cn from 'classnames';

import { BadgeProps } from './Badge.types.ts';
import styles from './Badge.module.scss';

const Badge: React.FC<BadgeProps> = (props) => {
  const {
    id,
    variant = 'primary',
    label,
    price,
    isActive,
    secondLabel,
    isAvailability,
    className,
    onClick,
    readonly = false,
    icon,
  } = props;

  return (
    <div
      onClick={() => {
        onClick && !readonly ? onClick(id) : null;
      }}
      className={cn(
        styles.wrapper,
        styles[variant],
        {
          [styles.active]: isActive && variant === 'primary',
          [styles.availability]: isAvailability && variant === 'primary',
          [styles.secondaryActive]: isActive && variant === 'secondary',
          [styles.withPrice]: !!price,
          [styles.wrapped]: !!secondLabel,
        },
        className,
      )}
    >
      {!!label && <span className={styles.label}>{label}</span>}
      {!!icon && <i className={cn(`icon-${icon}`)} />}
      {!!secondLabel && (
        <span className={styles.secondLabel}>{secondLabel}</span>
      )}
        {!!price && <span className={styles.price}>{`£${price}`}</span>}
    </div>
  );
};

export default Badge;
