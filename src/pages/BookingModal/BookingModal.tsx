import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import cn from 'classnames';
import { format, parse, set } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { toZonedTime } from 'date-fns-tz';

import styles from './BookingModal.module.scss';
import { Avatar, Button, Input, Textarea } from '@shared/ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema, schemaNoteRequired } from './BookingModal.validation.ts';
import { formattedHours, formattedWeekdays } from '@constants/daysAndTime.ts';
import {
  BOOKING_NOT_LOGIN_FIELDS,
  BookingModalProps,
  IBookingModalFields,
} from '@pages/BookingModal/BookingModal.types.ts';
import {
  AppModal,
  useAppModalSimpleHandlers,
} from '@shared/ui/AppModal/AppModal.tsx';
import { BookingConfirmedModal, BookingPaymentModal } from '@pages/index.ts';
import {
  combineDateTime,
  formatWithSuffix,
  getLongDay,
  getLongMonth,
  modifyWord2,
} from '@utils/helpers.ts';
import { useBook } from '@store/book.ts';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { appearance } from '@features/CheckoutForm/CheckoutForm.constants.ts';

export type FormData = yup.InferType<typeof schema>;
const stripePromise = loadStripe(
  'pk_test_51OrJaGJxYw9kyhBLx2XoX4wVo8wHv7Pnq7YbBki5N4rQf89OWJbYnr86NQujrzjHMEk405IOecCsr0FpOQfrl29n00JWkyx7gm',
);

const BookingModal: React.FC<BookingModalProps> = (props) => {
  const { setBookModalShow, data } = props;
  const modalHandlers = useAppModalSimpleHandlers();
  const [showBookingConfirmed, setShowBookingConfirmed] =
    useState<boolean>(false);
  const [showBookingPayment, setShowBookingPayment] = useState<boolean>(false);
  const createBook = useBook((state) => state.createBook);
  const createBookStatus = useBook((state) => state.createBookStatus);

  const user = JSON.parse(localStorage.getItem('user') ?? '{}');

  const {
    setValue,
    watch,
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(data.bookData.duration ? schema : schemaNoteRequired),
  });

  const day = formattedWeekdays.find((e) => e.id === data?.bookData?.day);
  const time = formattedHours.find(
    (e: { id: number; label: string }) => e.id === data.bookData?.time,
  );
  // Combine date and time into a single Date object
  const dateString = combineDateTime(day, time);
  // Convert the input date to the desired timezone
  const timeZone = 'Etc/GMT';
  const zonedDate = toZonedTime(dateString, timeZone);

  // Format the date
  const formattedTime = format(zonedDate, 'h:mmaaa', { locale: enUS });
  const formattedDate = formatWithSuffix(zonedDate, 'EEEE, MMMM do', {
    locale: enUS,
  });
  const formattedString = `${formattedTime}, ${formattedDate} (GMT)`;

  let descriptionLength = watch('note')?.length || 0;

  const formatStr = "h:mma, EEEE, MMMM do '(GMT)'";
  const dateStrModified = formattedString.replace('th', '');
  const parsedDate = parse(dateStrModified, formatStr, new Date());
  const finalDate = set(parsedDate, { year: new Date().getFullYear() });
  const formattedDateNew = format(finalDate, "MMMM d, yyyy HH:mm:ss 'GMT'");

  const handleFormSubmit = async (formData: IBookingModalFields) => {
    //Logged In Client book
    const body = {
      dateGMT: formattedDateNew,
      email: user?.email ? user?.email : formData.email,
      name: user?.name ? user?.name : formData.name,
      note: formData?.note ? formData.note : '',
      type: data?.bookData?.duration ? data?.bookData?.duration : 3,
      date: data?.body?.date,
      isVideoCall: data?.bookData?.type === 'VIDEO_CALL',
      isInPerson: data?.bookData?.type === 'IN_PERSON',
      isVoiceCall: data?.bookData?.type === 'VOICE_CALL',
      isLiveText: data?.bookData?.type === 'LIVE_TEXT',
      therapistUuid: data?.therapistData?.uuid,
    };
    try {
      if (!data?.bookData?.duration) {
        //consultation flow
        //Book and redirect to Booking Confirmed modal
        const response = await createBook(body);
        setShowBookingConfirmed(true);
        modalHandlers.show({
          therapistData: data.therapistData,
          bookData: data.bookData,
          // @ts-ignore
          body: { ...body, id: response?.id, bookingLink: response?.bookingLink },
        });
      } else {
        //session flow
        //Redirect Session Booking Payment modal
        setShowBookingPayment(true);
        modalHandlers.show({
          therapistData: data.therapistData,
          bookData: data.bookData,
          body: body,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onTermsOfUse = () => {
    window.open('https://www.offloadweb.com/terms-of-service-client', '_blanc')
  };

  const onPrivacyPolicy = () => {
    window.open('https://www.offloadweb.com/privacy-policy', '_blanc')
  };

  useEffect(() => {
    if (user?.uuid) {
      setValue('name', user?.name);
      setValue('email', user?.email);
    }
  }, [user]);

  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: 1500,
    currency: 'gbp',
    appearance,
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.imgWrapper}>
        <Avatar className={styles.img} photoUrl={data?.therapistData?.image} />
      </div>
      {data?.therapistData?.name && <span>{data?.therapistData?.name}</span>}
      {!!data?.bookData?.duration ? (
        <span className={styles.type}>Session</span>
      ) : (
        <span className={styles.type}>Consultation</span>
      )}
      <div className={styles.infoWrapper}>
        <div className={styles.row}>
          <i
            className={cn(
              `icon-${data?.bookData?.type.toLowerCase().replace('_', '-')}`,
              styles.icon,
            )}
          />
          <span className={styles.label}>
            {modifyWord2(data?.bookData?.type)}
          </span>
        </div>
        <div className={styles.row}>
          <i className={cn(`icon-time`, styles.icon)} />
          <>
            {!!data?.bookData?.duration ? (
              <>
                {
                  <span className={styles.label}>
                    {data?.bookData?.duration === 1
                      ? '30 minutes'
                      : '50 minutes'}
                  </span>
                }
              </>
            ) : (
              <span className={styles.label}>15 minutes</span>
            )}
          </>
        </div>
        <div className={styles.row}>
          <i className={cn(`icon-calendar`, styles.icon)} />
          <span className={styles.label}>
            {time?.label}, {getLongDay(day?.label)}, {getLongMonth(day?.month)}{' '}
            {day?.secondLabel}th
          </span>
        </div>
      </div>
      {data?.bookData?.duration && (
        <div className={styles.totalBlock}>
          <div className={styles.line}></div>
          <div className={styles.totalLine}>
            <span>Total</span>
            <span className={styles.price}>
              {data.therapistData?.userSessions?.[0]?.priceCurrency}
              {data?.bookData?.duration === 1
                ? data.therapistData?.userSessions?.[0]?.price
                : data.therapistData?.userSessions?.[1]?.price}
            </span>
          </div>
          <div className={styles.line}></div>
        </div>
      )}
      <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
        {!user?.uuid && (
          <>
            <Input
              placeholder={'First and last name'}
              {...register(BOOKING_NOT_LOGIN_FIELDS.NAME)}
              errorMessage={errors[BOOKING_NOT_LOGIN_FIELDS.NAME]?.message}
            />
            <Input
              placeholder={'Email'}
              {...register(BOOKING_NOT_LOGIN_FIELDS.EMAIL)}
              errorMessage={errors[BOOKING_NOT_LOGIN_FIELDS.EMAIL]?.message}
            />
          </>
        )}
        <Textarea
          variant={'secondary'}
          maxLength={130}
          className={styles.textarea}
          placeholder={
            `Please share anything that will help prepare for our ${!!data?.bookData?.duration ? 'session' : 'consultation'}`
          }
          {...register(BOOKING_NOT_LOGIN_FIELDS.NOTE)}
          errorMessage={errors[BOOKING_NOT_LOGIN_FIELDS.NOTE]?.message}
        />
        <span className={styles.countLabel}>{descriptionLength}/130</span>
        <Button
          fullWidth
          type={'submit'}
          label={user?.uuid ? 'Confirm' : 'Continue'}
          isLoading={createBookStatus === 'LOADING'}
        />
        {!user?.uuid && data?.bookData?.type !== 'LIVE_TEXT' && (
          <span className={styles.labelLinks}>
            By proceeding you agree to our{' '}
            <span onClick={onTermsOfUse}>Terms</span> and{' '}
            <span onClick={onPrivacyPolicy}>Privacy Policy</span>
          </span>
        )}
      </form>

      {showBookingConfirmed && (
        <AppModal
          width={389}
          {...modalHandlers}
          disableClosingModal
          closeIcon={false}
        >
          <BookingConfirmedModal
            data={modalHandlers.metaData}
            setBookModalShow={setBookModalShow}
            setShowBookingConfirmed={setShowBookingConfirmed}
          />
        </AppModal>
      )}

      {showBookingPayment && (
        <AppModal
          width={389}
          {...modalHandlers}
          disableClosingModal
          closeIcon={false}
        >
          {stripePromise && (
            <Elements stripe={stripePromise} options={options}>
              <BookingPaymentModal
                setBookModalShow={setBookModalShow}
                data={modalHandlers.metaData}
                setShowBookingPayment={setShowBookingPayment}
              />
            </Elements>
          )}
        </AppModal>
      )}
    </div>
  );
};
export default BookingModal;
