import React, { useEffect, useState } from 'react';
import cn from 'classnames';

import styles from './BookingEditCard.module.scss';
import {
  BookingEditCardProps,
  IBookingEditCardErrors,
} from './BookingEditCard.types.ts';
import { Badge, Checkbox, Input, Switch } from '@shared/ui';
import {getEnumKeysFromNumbers, modifyWord} from '@utils/helpers.ts';

const BookingEditCard: React.FC<BookingEditCardProps> = (props) => {
  const { className, setChanged, type, value, data, onChange, setIsError } = props;

  const [sessionTypes, setSessionTypes] = useState<string[]>([]);
  const typeNumbers = type === 'session' ? [1, 3, 4] : [1, 2, 3];
  const [errors, setErrors] = useState<IBookingEditCardErrors>({});
  const [showErrors, setShowErrors] = useState<boolean>(false);
  // const [isAvailability, setIsAvailability] = useState<boolean>(false);
  // const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  // const getTherapistAvailability = useAvailability(
  //   (state) => state.getTherapistAvailability,
  // );
  // const therapistAvailability = useAvailability(
  //   (state) => state.therapistAvailability,
  // );

  const errorChecker = () => {
    let hasError = false;
    const errors: any = {};

    if (type === 'consultation' && !value?.types?.length) {
      errors.consultationError = 'Please select at least one type';
      hasError = true;
    } else if (type === 'session') {
      //Check for stripe connection error
      if (!data?.stripeAccountId) {
        errors.paymentError = 'Please set up payments on Account page';
        hasError = true;
      }

      //Check for duration error
      if (!value?.isActive30 && !value?.isActive50) {
        errors.durationError = 'Please select at least one duration';
        hasError = true;
      }

      // Check for price errors
      if (
        !value?.min30Price &&
        !errors.min30TypeError &&
        !errors?.addressError &&
        value?.isActive30
      ) {
        errors.min30PriceError = 'Please set a price';
        hasError = true;
      }
      if (
        !value?.min50Price &&
        !errors.min50TypeError &&
        !errors?.addressError &&
        value?.isActive50
      ) {
        errors.min50PriceError = 'Please set a price';
        hasError = true;
      }

      // Check for type errors
      if (
        !value?.min30Types?.length &&
        !errors.min30PriceError &&
        !errors.durationError &&
        value?.isActive30
      ) {
        errors.min30TypeError = 'Please select at least one type';
        hasError = true;
      }
      if (
        !value?.min50Types?.length &&
        !errors.min50PriceError &&
        !errors.durationError &&
        value?.isActive50
      ) {
        errors.min50TypeError = 'Please select at least one type';
        hasError = true;
      }

      // Check for address error
      if (
        (value?.min30Types?.includes('in_person') ||
          value?.min50Types?.includes('in_person')) &&
        !data?.address &&
        !errors.min50TypeError &&
        !errors.min50PriceError
      ) {
        errors.addressError = 'Please add In person address in Account page';
        hasError = true;
      }
    }
    setErrors(errors);
    setIsError && setIsError(showErrors);
    return hasError;
  };

  const onChangeSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const hasError = errorChecker();
    // if(checked && !isAvailability){
    //   toast.error('Please set up your Availability');
    //   return;
    // }
    if (checked && hasError) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    onChange({ ...value, showActive: checked });
  };

  const onClickConsultationBadge = (label: string) => {
    setChanged(true)
    const includesType = value.types?.includes(label);
    setShowErrors(false);
    if (includesType) {
      const filteredArr = value.types?.filter((e: string) => e !== label);
      onChange({ ...value, types: filteredArr });
    } else if (value?.types === undefined) {
      value.types = [];
      onChange({ ...value, types: [...value?.types, label] });
    } else {
      onChange({ ...value, types: [...value.types, label], showActive: true });
    }
  };

  const onClickBadge30 = (label: string) => {
    setChanged(true)
    const includesType = value?.min30Types?.includes(label);
    setShowErrors(false);
    if (includesType) {
      const filteredArr = value?.min30Types?.filter((e: string) => e !== label);
      onChange({ ...value, min30Types: filteredArr });
    } else if (value?.min30Types === undefined) {
      value.min30Types = [];
      onChange({ ...value, min30Types: [...value.min30Types, label] });
    } else {
      onChange({ ...value, min30Types: [...value.min30Types, label], showActive: true });
    }
  };

  const onClickBadge50 = (label: string) => {
    setChanged(true)
    const includesType = value?.min50Types?.includes(label);
    setShowErrors(false);
    if (includesType) {
      const filteredArr = value?.min50Types?.filter((e: string) => e !== label);
      onChange({ ...value, min50Types: filteredArr });
    } else if (value?.min50Types === undefined) {
      value.min50Types = [];
      onChange({ ...value, min50Types: [...value.min50Types, label] });
    } else {
      onChange({ ...value, min50Types: [...value.min50Types, label], showActive: true });
    }
  };

  useEffect(() => {
    const hasError = errorChecker();
    if (value?.showActive && hasError) {
      onChange({ ...value, showActive: false });
    }
  }, [value]);

  useEffect(() => {
    setSessionTypes(getEnumKeysFromNumbers(typeNumbers));
  }, [type]);

  useEffect(() => {
    errorChecker();
  }, [value]);

  //This code for toaster when user not have availability and want toggle on booking edit box
  // useEffect(() => {
  //   if (user?.username) {
  //     getTherapistAvailability(
  //       user?.username,
  //       Math.ceil(startTimestampToday / 1000),
  //       Math.ceil(startTimestampNextMonth / 1000 + 2592000),
  //     );
  //   }
  // }, []);

  // useEffect(()=>{
  //   let newType = type + 's'
  //   // @ts-ignore
  //   setIsAvailability(hasTypeData(therapistAvailability, newType))
  // },[therapistAvailability])

  return (
    <div className={cn(styles.wrapper, styles[type], className)}>
      {type === 'consultation' && showErrors && errors?.consultationError && (
        <span className={cn(styles.error, styles.consultationError)}>
          {errors.consultationError}
        </span>
      )}
      {type === 'session' && showErrors && errors?.durationError && (
        <span className={cn(styles.error, styles.durationError)}>
          {errors.durationError}
        </span>
      )}
      {type === 'session' && showErrors && errors?.min30TypeError && (
        <span className={cn(styles.error, styles.min30TypeError)}>
          {errors.min30TypeError}
        </span>
      )}
      {type === 'session' && showErrors && errors?.min30PriceError && (
        <span className={cn(styles.error, styles.min30PriceError)}>
          {errors.min30PriceError}
        </span>
      )}
      {type === 'session' && showErrors && errors?.min50TypeError && (
        <span className={cn(styles.error, styles.min50TypeError)}>
          {errors.min50TypeError}
        </span>
      )}
      {type === 'session' && showErrors && errors?.min50PriceError && (
        <span className={cn(styles.error, styles.min50PriceError)}>
          {errors.min50PriceError}
        </span>
      )}
      {type === 'session' && showErrors && errors?.paymentError && (
        <span className={cn(styles.error, styles.paymentError)}>
          {errors.paymentError}
        </span>
      )}
      {type === 'session' && showErrors && errors?.addressError && (
        <span className={cn(styles.error, styles.addressError)}>
          {errors.addressError}
        </span>
      )}

      <div className={styles.titleWrapper}>
        <span className={styles.title}>{modifyWord(type)}s</span>
        <Switch
          value={value?.showActive ? value.showActive : false}
          onChange={onChangeSwitch}
        />
      </div>
      {type === 'consultation' && (
        <span className={styles.timeLabel}>15 min</span>
      )}
      <div className={styles.mainBlock}>
        {type === 'consultation' ? (
          <div className={styles.row}>
            <span className={styles.label}>Type: </span>
            <div className={styles.badgeWrapper}>
              {sessionTypes.map((item, index) => (
                <Badge
                  onClick={() => {
                    onClickConsultationBadge(item.toLowerCase());
                  }}
                  id={index}
                  isActive={value?.types?.includes(item.toLowerCase())}
                  key={item}
                  variant={'secondary'}
                  label={modifyWord(item.toLowerCase())?.replace('_', ' ')}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.block}>
              <Checkbox
                checked={value?.isActive30}
                className={styles.checkbox}
                label={'30 mins'}
                onChange={(e) => {
                  setChanged(true)
                  setShowErrors(false);
                  onChange({ ...value, isActive30: e.target.checked, showActive: e.target.checked ? true : value?.showActive });
                }}
              />
              <div className={styles.row}>
                <span className={styles.label}>Price:</span>
                <Input
                  value={value?.min30Price ? value.min30Price : ''}
                  type={'number'}
                  className={styles.input}
                  onChange={(e) => {
                    setChanged(true)
                    setShowErrors(false);
                    onChange({ ...value, min30Price: Math.abs(Number(e.target.value)), showActive: (Math.abs(Number(e.target.value)) && value?.isActive30)  ? true : value?.showActive });
                  }}
                />
                <span className={styles.priceType}>£</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Type: </span>
                <div className={styles.badgeWrapper}>
                  {sessionTypes.map((item, index) => (
                    <Badge
                      id={index}
                      key={item}
                      onClick={() => {
                        onClickBadge30(item.toLowerCase());
                      }}
                      isActive={value?.min30Types?.includes(item.toLowerCase())}
                      variant={'secondary'}
                      label={modifyWord(item.toLowerCase())?.replace('_', ' ')}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.block}>
              <Checkbox
                checked={value?.isActive50}
                className={styles.checkbox}
                label={'50 mins'}
                onChange={(e) => {
                  setChanged(true)
                  setShowErrors(false);
                  onChange({ ...value, isActive50: e.target.checked, showActive: e.target.checked ? true : value?.showActive  });
                }}
              />
              <div className={styles.row}>
                <span className={styles.label}>Price:</span>
                <Input
                  value={value?.min50Price ? value.min50Price : ''}
                  type={'number'}
                  className={styles.input}
                  onChange={(e) => {
                    setChanged(true)
                    setShowErrors(false);
                    onChange({ ...value, min50Price: Math.abs(Number(e.target.value)), showActive: (Math.abs(Number(e.target.value)) && value?.isActive50)  ? true : value?.showActive });
                  }}
                />
                <span className={styles.priceType}>£</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Type: </span>
                <div className={styles.badgeWrapper}>
                  {sessionTypes.map((item, index) => (
                    <Badge
                      id={index}
                      key={item}
                      onClick={() => {
                        onClickBadge50(item.toLowerCase());
                      }}
                      isActive={value?.min50Types?.includes(item.toLowerCase())}
                      variant={'secondary'}
                      label={modifyWord(item.toLowerCase())?.replace('_', ' ')}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default BookingEditCard;