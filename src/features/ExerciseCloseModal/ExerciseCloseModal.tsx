import React from 'react';
import { ExerciseCloseModalProps } from './ExerciseCloseModal.types.ts';
import styles from './ExerciseCloseModal.module.scss';
import { Button } from '@shared/ui';
import {useNavigate} from "react-router-dom";
import {useAppModalSimpleHandlers} from "@shared/ui/AppModal/AppModal.tsx";
import {useExercises} from "@store/exercises.ts";

const ExerciseCloseModal: React.FC<ExerciseCloseModalProps> = (props) => {
  const { setCloseModalShow, users } = props;
  const navigate = useNavigate();
  const modalHandlers = useAppModalSimpleHandlers();
  const reset = useExercises((state) => state.reset);
  console.log('users', users);

  const onYes = () =>{
    setCloseModalShow(false);
    modalHandlers.close();
    reset()
    navigate(-1)
  }

  const onNo = () => {
    setCloseModalShow(false);
    modalHandlers.close();
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.bold}>Close the exercise?</span>
      <span className={styles.label}>If you close the exercise your changes will be lost</span>
      <Button
        variant={'secondary'}
        label={'Yes'}
        fullWidth
        className={styles.button}
        onClick={onYes}
      />
      <Button
        variant={'secondary'}
        label={'No'}
        fullWidth
        className={styles.button}
        onClick={onNo}
      />
    </div>
  );
};
export default ExerciseCloseModal;
