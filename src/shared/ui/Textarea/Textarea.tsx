import React, { forwardRef } from 'react';
import cn from 'classnames';

import styles from './Textarea.module.scss';
import { TextareaProps } from './Textarea.types.ts';

const Textarea: React.ForwardRefRenderFunction<
  HTMLTextAreaElement,
  TextareaProps
> = (props, ref) => {
  const {
    value,
    variant = 'primary',
    onChange,
    placeholder,
    className,
    disabled,
    resize,
    errorMessage,
    ...rest
  } = props;

  return (
    <div
      className={cn(
        styles.wrapper,
        {
          [styles.error]: !!errorMessage,
        },
        className,
      )}
    >
      <textarea
        className={cn(styles.base, styles[variant], {
          [styles.disabled]: disabled,
          [styles.resize]: !resize,
        })}
        value={value}
        ref={ref}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        {...rest}
      />
      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
    </div>
  );
};

export default forwardRef(Textarea);
