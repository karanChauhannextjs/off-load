import React, { useEffect, useState } from 'react';

import { Button, Input } from '@shared/ui';
import styles from './ClientConnectModal.module.scss';
import PlusPerson from '@assets/images/code-plus-person.svg';
import Connection from '@assets/images/connection.svg';
// import Connection3Step from '@assets/svg/connect3.svg';
import { ClientConnectModalProps } from './ClientConnectModal.types.ts';
import cn from 'classnames';
// import {Diagram} from '@widgets/index.ts';
import { useInvite } from '@store/invite.ts';

const ClientConnectModal: React.FC<ClientConnectModalProps> = (props) => {
  const { step, setCode, isWrongCode, onNext } = props;
  const connectClientStatus = useInvite((state) => state.connectClientStatus);
  const [codeError, setCodeError] = useState('');
  const [codeLocal, setCodeLocal] = useState('');
  // const dataDiagram = [
  //   {
  //     name: 'Page G',
  //     cr: 150,
  //     value: 2,
  //     pr: 80,
  //     amt: 5,
  //     index: 0,
  //     date: 'JUN 12',
  //     d: 'A',
  //   },
  //   {
  //     name: 'Page A',
  //     cr: 150,
  //     value: 3,
  //     pr: 80,
  //     amt: 5,
  //     index: 0,
  //     date: 'JUN 12',
  //     d: 'M',
  //   },
  //   {
  //     name: 'Page B',
  //     cr: null,
  //     value: 5,
  //     pr: null,
  //     amt: 5,
  //     index: 1,
  //     date: 'JUN 12',
  //     d: 'T',
  //   },
  //   {
  //     name: 'Page C',
  //     cr: null,
  //     value: 4,
  //     pr: null,
  //     amt: 5,
  //     index: 2,
  //     date: 'JUN 12',
  //     d: 'W',
  //   },
  //   {
  //     name: 'Page D',
  //     cr: 300,
  //     value: 4,
  //     pr: 80,
  //     amt: 5,
  //     index: 3,
  //     date: 'JUN 12',
  //     d: 'T',
  //   },
  //   {
  //     name: 'Page E',
  //     cr: null,
  //     value: 2,
  //     pr: null,
  //     amt: 5,
  //     index: 4,
  //     date: 'JUN 12',
  //     d: 'F',
  //   },
  //   {
  //     name: 'Page F',
  //     cr: null,
  //     value: 1,
  //     pr: null,
  //     amt: 5,
  //     index: 5,
  //     date: 'JUN 12',
  //     d: 'S',
  //   },
  //   {
  //     name: 'Page G',
  //     cr: 700,
  //     value: 5,
  //     pr: 400,
  //     amt: 5,
  //     index: 6,
  //     date: 'JUN 12',
  //     d: 'S',
  //   },
  //   {
  //     name: 'Page G',
  //     cr: 800,
  //     value: 1,
  //     pr: 700,
  //     amt: 5,
  //     index: 7,
  //     date: 'JUN 12',
  //     d: 'A',
  //   },
  // ];

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    setCodeLocal(e.target.value);
    if (!e.target.value) {
      setCodeError('Please enter a code');
    } else {
      setCodeError('');
    }
  };

  useEffect(() => {
    setCodeError('');
  }, []);

  useEffect(() => {
    if (isWrongCode) {
      setCodeError('Sorry, the code was incorrect ');
    } else {
      setCodeError('');
    }
  }, [isWrongCode]);

  return (
    <div className={styles.connectWrapper} onClick={(e)=>{e.stopPropagation()}}>
      {step === 1 && (
        <div className={styles.firstStepWrapper}>
          <div className={styles.topWrapper}>
            <img src={PlusPerson} alt="plus" />
          </div>
          <div className={styles.labelsWrapper}>
            <span className={styles.boldText}>Connect your therapist</span>
            <span className={styles.label}>
              Please enter your connection code
            </span>
          </div>
          <div className={styles.bottomWrapper}>
            {codeError && (
              <span className={styles.errorLabel}>{codeError}</span>
            )}
            <Input
              className={styles.codeInput}
              placeholder={'Enter connection code'}
              onChange={(e) => onChangeInput(e)}
              maxLength={6}
            />
            <span className={styles.infoText}>
              By tapping ‘Next’ you agree to share information from your care
              plan with your therapist. Only connect with therapists you know
              and trust.
            </span>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className={styles.secondStepWrapper}>
          <img
            src={Connection}
            alt="connection"
            className={styles.connectionImage}
          />
          <div className={styles.labels2wrapper}>
            <span className={styles.bold2}>
              Congrats! You’re now connected{' '}
            </span>
            <span className={styles.label}>
              Now you can receive your health plan from your therapist
            </span>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className={styles.thirdStepWrapper}>
          <div className={styles.diagramWrapper}>
            {/*<Diagram*/}
            {/*  data={dataDiagram}*/}
            {/*  widthWeeks={false}*/}
            {/*  linesWrapperClassName={styles.linesWrapper}*/}
            {/*  className={styles.diagram}*/}
            {/*/>*/}
          </div>
          <div className={styles.infosWrapper}>
            <span className={styles.bold2}>You’re in control</span>
            <span className={styles.label}>
              Your therapist can only access the data below and can’t log or
              edit anything. Also you can stop sharing anytime
            </span>
            <span className={styles.bold3}>What your therapist can see:</span>
            <ul className={styles.ul}>
              <li style={{ marginLeft: 5 }}>
                Check ins: a view-only version of your mood check ins.
              </li>
              <li>
                Care plan: your responses to care plan related exercises only.
              </li>
            </ul>
          </div>
        </div>
      )}
      <div
        className={cn(styles.buttonWrapper, { [styles.withPadding]: step > 1 })}
      >
        <Button
          label={'Next'}
          onClick={() => {
            if (step === 1 && !codeLocal) {
              setCodeError('Please enter a code');
            }
            onNext();
          }}
          fullWidth
          isLoading={connectClientStatus === 'LOADING'}
          className={cn({ [styles.firstStepButton]: step === 1 })}
        />
      </div>
    </div>
  );
};
export default ClientConnectModal;
