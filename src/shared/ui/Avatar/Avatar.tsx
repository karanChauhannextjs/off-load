import React from 'react';
import cn from 'classnames';

import { AvatarProps } from './Avatar.types.ts';
import styles from './Avatar.module.scss';
import AvatarLogo from '@assets/svg/avatar.svg';

const Avatar: React.FC<AvatarProps> = (props) => {
  const { className, photoUrl, onClick } = props;

  return (
    <div className={cn(styles.wrapper, className)} onClick={onClick}>
      {!!photoUrl ? (
        <figure className={styles.imgWrapper}>
          <img className={styles.img} src={photoUrl} alt="Avatar" />
        </figure>
      ) : (
        <img src={AvatarLogo} alt="Avatar" />
      )}
    </div>
  );
};
export default Avatar;
