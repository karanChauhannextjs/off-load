import { useEffect, useState } from 'react';
import cn from 'classnames';

import { Button } from '@shared/ui';
import styles from './CheckinComplete.module.scss';
import checkin1 from '../../assets/svg/checkin1.svg';
import checkin2 from '../../assets/svg/checkin2.svg';
import checkin3 from '../../assets/svg/checkin3.svg';
import checkin4 from '../../assets/svg/checkin4.svg';
import checkin5 from '../../assets/svg/checkin5.svg';
import Arrow from '../../assets/svg/checkinArrow.svg';
import Logo from '../../assets/svg/logo.svg';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFeeling } from '@store/feeling.ts';
import { encodeDecodeSecretKey, getCurrentDate } from '@utils/helpers.ts';
import CryptoJS from 'crypto-js';
import { USER_TYPES } from '@constants/user.ts';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet';

const CheckinComplete = () => {
  const [step, setStep] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= 768,
  );
  const [selectedCauses, setSelectedCauses] = useState<number[]>([]);
  const [note, setNote] = useState('');
  const getCauses = useFeeling((state) => state.getCauses);
  const causes = useFeeling((state) => state.causes);
  const userFeeling = useFeeling((state) => state.userFeeling);
  const { checkId } = location.state as { checkId: number };
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');

  const images: { [key: number]: string } = {
    1: checkin1,
    2: checkin2,
    3: checkin3,
    4: checkin4,
    5: checkin5,
  };

  const onContinue = () => {
    setStep(step + 1);
  };

  const onBack = () => {
    if (step === 1) {
      navigate(-1);
    }
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const onClose = async () => {
    if (selectedCauses?.length || note) {
      const feelBody = {
        note: CryptoJS.AES.encrypt(note, encodeDecodeSecretKey).toString(),
        feeling: checkId,
        date: getCurrentDate(),
        causes: selectedCauses,
      };
      if (user?.type === USER_TYPES.CLIENT) {
        await userFeeling(feelBody);
        // toast.success(`Check in Complete! 🥳`,{
        //   style:{background:'#0FCEC5'}
        // })
        navigate(-1);
      } else if (!user?.type) {
        if (step === 2) {
          await userFeeling(feelBody);
        }
        // localStorage.setItem('checkinCompleteData', JSON.stringify(feelBody));
        // navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.CLIENT_SIGN_UP}`);
        navigate(-1);
        // toast.success(`Check in Complete! 🥳`,{
        //   style:{background:'#0FCEC5'}
        // })
      }
    } else {
      navigate(-1);
    }
  };

  const onCauseClick = (id: number) => {
    const includes = selectedCauses?.includes(id);
    if (includes) {
      const filteredArr = selectedCauses.filter((e) => e !== id);
      setSelectedCauses(filteredArr);
    } else if (selectedCauses?.length < 5) {
      selectedCauses.push(id);
      setSelectedCauses([...selectedCauses]);
    }
  };

  const onNoteChange = (e: any) => {
    setNote(e.target.value);
  };

  const getCausesData = async () => {
    try {
      await getCauses();
    } catch (err) {
      console.log('Err', err);
    }
  };

  const onSubmit = async () => {
    const feelBody = {
      note: CryptoJS.AES.encrypt(note, encodeDecodeSecretKey).toString(),
      feeling: checkId,
      date: getCurrentDate(),
      causes: selectedCauses,
    };
    if (user?.type === USER_TYPES.CLIENT) {
      await userFeeling(feelBody);
      toast.success(`Check in Complete! 🥳`, {
        style: { background: '#0FCEC5', width: 335 },
      });
      navigate(-1);
    } else if (!user?.type) {
      await userFeeling(feelBody);
      // localStorage.setItem('checkinCompleteData', JSON.stringify(feelBody));
      // navigate(`${USER_PUBLIC_BASE_URL}/${RoutesEnum.CLIENT_SIGN_UP}`);
      navigate(-1);
      toast.success(`Check in Complete! 🥳`, {
        style: { background: '#0FCEC5', width: 335 },
      });
    }
  };

  useEffect(() => {
    getCausesData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <Helmet>
        <meta name="theme-color" content="#FFDC66" />
      </Helmet>
      <div className={styles.mainBlock}>
        <div className={styles.topActions}>
          <span className={styles.iconWrapper} onClick={onBack}>
            <i className={cn('icon-left-arrow', styles.arrow)} />
          </span>
          <span
            className={cn(styles.iconWrapper, styles.closeWrapper)}
            onClick={onClose}
          >
            <i className={cn('icon-plus', styles.plus)} />
          </span>
        </div>
        <div className={cn(styles.mainBody)}>
          <div
            className={cn(styles.mainBlock2, {
              [styles.background]: !isMobileScreen,
            })}
          >
            {step !== 1 && (
              <img src={images[checkId]} alt="Smile" className={styles.smile} />
            )}
            {step === 1 && (
              <div className={styles.firsStepWrapper}>
                <div
                  className={cn(styles.firstScrollable, {
                    [styles.firstScrollableSignout]: !user?.type,
                  })}
                >
                  <img
                    src={images[checkId]}
                    alt="Smile"
                    className={styles.smile}
                  />
                  <span className={styles.question}>
                    What’s making you feel this way?
                  </span>
                  <span className={styles.selectLabel}>SELECT UP TO 5</span>
                  <div className={styles.causesWrapper}>
                    {causes?.map((e: any) => {
                      return (
                        <div
                          className={cn(styles.cause, {
                            [styles.selectedCause]: selectedCauses.includes(
                              e.id,
                            ),
                          })}
                          onClick={() => {
                            onCauseClick(e.id);
                          }}
                        >
                          <span className={styles.causeLabel}>{e.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {selectedCauses?.length > 0 ? (
                  <Button
                    label={'Continue'}
                    onClick={onContinue}
                    className={cn(styles.button, styles.buttonEnabled, {
                      [styles.button2]: causes?.length < 11,
                    })}
                  />
                ) : (
                  <Button
                    label={'Continue'}
                    className={cn(styles.button, {
                      [styles.button2]: causes?.length < 11,
                    })}
                  />
                )}
              </div>
            )}
            {step === 2 && (
              <div className={styles.secondStepWrapper}>
                <span className={styles.label}>Causes</span>
                <div className={styles.selectedCausesWrapper}>
                  {selectedCauses?.map((e: any) => {
                    const findElement = causes?.find((el: any) => e === el.id);
                    return (
                      <div className={cn(styles.cause, styles.selectedCause)}>
                        <span className={styles.causeLabel}>
                          {findElement?.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <span className={cn(styles.label, styles.note)}>Notes</span>
                <div className={styles.noteWrapper}>
                  <span className={styles.notesLimit}>{note?.length}/200</span>
                  <textarea
                    className={styles.textarea}
                    placeholder={'Add a note...'}
                    onChange={onNoteChange}
                    maxLength={200}
                  />
                </div>
                <span className={styles.offloadText}>offload it</span>
                <img src={Arrow} alt="arrow" className={styles.arrowCheck} />
                <img
                  src={Logo}
                  alt="button"
                  className={styles.logo}
                  onClick={onSubmit}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CheckinComplete;
