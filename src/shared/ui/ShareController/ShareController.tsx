import styles from './ShareController.module.scss';
import React, {useEffect, useState} from 'react';
import { ShareControllerProps } from '@shared/ui/ShareController/ShareController.types.ts';
import cn from 'classnames';
import {Switch} from "@shared/ui";
import {useProfileStore} from "@store/profile.ts";

const ShareController: React.FC<ShareControllerProps> = (props) => {
  const { isActive, className, isActiveChat, switchs, setSwitchs } = props;
  const [checked, setChecked] = useState(false);
  const shareClientOffloads = useProfileStore(state => state.shareClientOffloads)

  const onSwitchChange = async (e:any) => {
    setChecked(e.target.checked)
    setSwitchs({
      ...switchs,
      [isActiveChat.id]: e.target.checked
    });
    try {
      await shareClientOffloads({
        therapistUuid:isActiveChat?.therapist?.uuid,
        shareOffloads: e.target.checked
      })
    }catch (err){
      console.log('error', err);
    }
  }

  useEffect(()=>{
    setChecked(!!isActive)
  },[isActive])

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(styles.shareWrapper, className)}
    >
      <span className={styles.label}>Share my offloads</span>
      <Switch value={switchs[isActiveChat?.id]!== undefined ? switchs[isActiveChat?.id] : checked} defaultChecked={isActive} onChange={onSwitchChange}/>
    </div>
  );
};
export default ShareController;
