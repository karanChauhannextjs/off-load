import React, { useEffect, useRef } from 'react';
import { UploadProps } from '@features/Upload/Upload.types.ts';
import cn from 'classnames';
import styles from './Upload.module.scss';

const Upload: React.FC<UploadProps> = (props) => {
  const { className, accept = 'image/*', onChange } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!!inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onChange]);

  return (
    <div className={cn(styles.mainWrapper, className)}>
      <div className={cn(styles.wrapper)}>
        <input
          ref={inputRef}
          className={styles.input}
          type={'file'}
          accept={accept}
          onChange={onChange}
          title={''}
        />
        <i className={cn('icon-edit', styles.icon)} />
      </div>
    </div>
  );
};
export default Upload;
