import styles from './MessageDeleteModal.module.scss'
import React, {useState} from "react";
import {MessageDeleteModalProps} from "./MessageDeleteModal.types.ts";
import {Button} from "@shared/ui";

const MessageDeleteModal:React.FC<MessageDeleteModalProps>  = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const {setMessageDelete, onDelete} = props
  return <div className={styles.wrapper}>
    <p className={styles.title}>Delete all messages with this person?</p>
    <Button isLoading={isLoading} className={styles.deleteButton} label={'Delete all messages'} variant={'secondary'} onClick={()=>{
      setIsLoading(true);
      onDelete()}}/>
    <Button label={'Cancel'} variant={'secondary'} onClick={()=>{
      setMessageDelete(false)
    }}/>
  </div>
}
export default MessageDeleteModal