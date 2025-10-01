import React from 'react';
import styles from './DeleteMessagePopup.module.scss';
import { IDeleteMessagePopupProps } from '@features/DeleteMessagePopup/DeleteMessagePopup.types.ts';
import cn from "classnames";

export const DeleteMessagePopup: React.FC<IDeleteMessagePopupProps> = (
  props,
) => {
  const { x, y, label, className, onDelete } = props;

  const menuStyle = {
    top: y+5,
    left: x-50,
  };

  return (
    <div style={menuStyle} className={cn(styles.popupWrapper, className)}>
      <ul>
        <li
          onClick={onDelete}
        >
          {label}
          <i className={'icon-bin'}/>
        </li>
      </ul>
    </div>
  );
};
