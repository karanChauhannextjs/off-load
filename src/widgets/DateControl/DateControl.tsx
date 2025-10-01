import React, { useEffect } from 'react';
import * as yup from 'yup';
import cn from 'classnames';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import styles from './DateControl.module.scss';
import { TimeControl } from '@features/index.ts';
import { schema } from './DateControl.validation.ts';
import { timeData, WEEKDAYS } from '@constants/date.ts';
import { DateControlDays, DateControlProps } from './DateControl.types.ts';
import { plusChecker } from '@utils/helpers.ts';
import { useAvailability } from '@store/availability.ts';
import toast from 'react-hot-toast';

export type FormData = yup.InferType<typeof schema>;
const DateControl: React.FC<DateControlProps> = (props) => {
  const { data, type } = props;

  const createTherapistWorkHour = useAvailability(
    (state) => state.createTherapistWorkHour,
  );

  const { setValue, getValues, control } = useForm<FormData>({
    resolver: yupResolver(schema),
  });
  const {
    fields: mondayFields,
    append: mondayFieldsAppend,
    remove: mondayFieldsRemove,
  } = useFieldArray({
    control,
    name: DateControlDays.MONDAY,
  });

  const {
    fields: tuesdayFields,
    append: tuesdayFieldsAppend,
    remove: tuesdayFieldsRemove,
  } = useFieldArray({
    control,
    name: DateControlDays.TUESDAY,
  });

  const {
    fields: wednesdayFields,
    append: wednesdayFieldsAppend,
    remove: wednesdayFieldsRemove,
  } = useFieldArray({
    control,
    name: DateControlDays.WEDNESDAY,
  });

  const {
    fields: thursdayFields,
    append: thursdayFieldsAppend,
    remove: thursdayFieldsRemove,
  } = useFieldArray({
    control,
    name: DateControlDays.THURSDAY,
  });

  const {
    fields: fridayFields,
    append: fridayFieldsAppend,
    remove: fridayFieldsRemove,
  } = useFieldArray({
    control,
    name: DateControlDays.FRIDAY,
  });

  const {
    fields: saturdayFields,
    append: saturdayFieldsAppend,
    remove: saturdayFieldsRemove,
  } = useFieldArray({
    control,
    name: DateControlDays.SATURDAY,
  });

  const {
    fields: sundayFields,
    append: sundayFieldsAppend,
    remove: sundayFieldsRemove,
  } = useFieldArray({
    control,
    name: DateControlDays.SUNDAY,
  });

  const addMondayDate = async () => {
    if (
      !mondayFields.length ||
      (!!getValues(`monday.${mondayFields.length - 1}`).end.value &&
        plusChecker(mondayFields, type))
    ) {
      mondayFieldsAppend([
        {
          start: '',
          end: '',
        },
      ]);
      if (mondayFields.length < 1) {
        try {
          await createTherapistWorkHour({
            type: type,
            start: '09:00 am',
            end: '05:00 pm',
            weekDay: 2,
          });
          toast.success('Changes saved');
        } catch (e: any) {
          toast.error(e);
        }
      } else {
        const index = timeData.findIndex(
          (item) =>
            item.value === mondayFields[mondayFields.length - 1].end.value,
        );
        try {
          await createTherapistWorkHour({
            type: type,
            start: timeData[index + 2]?.value?.replace('  ', ' '),
            end: timeData[index + 4]?.value?.replace('  ', ' '),
            weekDay: 2,
          });
          toast.success('Changes saved');
        } catch (e: any) {
          toast.error(e);
        }
      }
    }
  };
  const addTuesdayDate = async () => {
    if (
      !tuesdayFields.length ||
      (!!getValues(`tuesday.${tuesdayFields.length - 1}`).end.value &&
        plusChecker(tuesdayFields, type))
    ) {
      tuesdayFieldsAppend([
        {
          start: '',
          end: '',
        },
      ]);
      if (tuesdayFields.length < 1) {
        try {
          await createTherapistWorkHour({
            type: type,
            start: '09:00 am',
            end: '05:00 pm',
            weekDay: 3,
          });
          toast.success('Changes saved');
        } catch (e: any) {
          toast.error(e);
        }
      } else {
        const index = timeData.findIndex(
          (item) =>
            item.value === tuesdayFields[tuesdayFields.length - 1].end.value,
        );
        try {
          await createTherapistWorkHour({
            type: type,
            start: timeData[index + 2]?.value?.replace('  ', ' '),
            end: timeData[index + 4]?.value?.replace('  ', ' '),
            weekDay: 3,
          });
          toast.success('Changes saved');
        } catch (e: any) {
          toast.error(e);
        }
      }
    }
  };
  const addWednesdayDate = async () => {
    if (
      !wednesdayFields.length ||
      (!!getValues(`wednesday.${wednesdayFields.length - 1}`).end.value &&
        plusChecker(wednesdayFields, type))
    ) {
      wednesdayFieldsAppend([
        {
          start: '',
          end: '',
        },
      ]);
      if (wednesdayFields.length < 1) {
        try {
          await createTherapistWorkHour({
            type: type,
            start: '09:00 am',
            end: '05:00 pm',
            weekDay: 4,
          });
          toast.success('Changes saved');
        } catch (e: any) {
          toast.error(e);
        }
      } else {
        const index = timeData.findIndex(
          (item) =>
            item.value ===
            wednesdayFields[wednesdayFields.length - 1].end.value,
        );

        try {
          await createTherapistWorkHour({
            type: type,
            start: timeData[index + 2]?.value?.replace('  ', ' '),
            end: timeData[index + 4]?.value?.replace('  ', ' '),
            weekDay: 4,
          });
          toast.success('Changes saved');
        } catch (e: any) {
          toast.error(e);
        }
      }
    }
  };
  const addThursdayDate = async () => {
    if (
      !thursdayFields.length ||
      (!!getValues(`thursday.${thursdayFields.length - 1}`).end.value &&
        plusChecker(thursdayFields, type))
    ) {
      thursdayFieldsAppend([
        {
          start: '',
          end: '',
        },
      ]);
      if (thursdayFields.length < 1) {
        try {
          await createTherapistWorkHour({
            type: type,
            start: '09:00 am',
            end: '05:00 pm',
            weekDay: 5,
          });
          toast.success('Changes saved');
        } catch (e: any) {
          toast.error(e);
        }
      } else {
        const index = timeData.findIndex(
          (item) =>
            item.value === thursdayFields[thursdayFields.length - 1].end.value,
        );
        try {
          await createTherapistWorkHour({
            type: type,
            start: timeData[index + 2]?.value?.replace('  ', ' '),
            end: timeData[index + 4]?.value?.replace('  ', ' '),
            weekDay: 5,
          });
          toast.success('Changes saved');
        } catch (e: any) {
          toast.error(e);
        }
      }
    }
  };
  const addFridayDate = async () => {
    if (
      !fridayFields.length ||
      (!!getValues(`friday.${fridayFields.length - 1}`).end.value &&
        plusChecker(fridayFields, type))
    ) {
      fridayFieldsAppend([
        {
          start: '',
          end: '',
        },
      ]);
      if (fridayFields.length < 1) {
        try {
          await createTherapistWorkHour({
            type: type,
            start: '09:00 am',
            end: '05:00 pm',
            weekDay: 6,
          });
          toast.success('Changes saved');
        } catch (e: any) {
          toast.error(e);
        }
      } else {
        const index = timeData.findIndex(
          (item) =>
            item.value === fridayFields[fridayFields.length - 1].end.value,
        );
        try {
          await createTherapistWorkHour({
            type: type,
            start: timeData[index + 2]?.value?.replace('  ', ' '),
            end: timeData[index + 4]?.value?.replace('  ', ' '),
            weekDay: 6,
          });
          toast.success('Changes saved');
        } catch (e: any) {
          toast.error(e);
        }
      }
    }
  };
  const addSaturdayDate = async () => {
    if (
      !saturdayFields.length ||
      (!!getValues(`saturday.${saturdayFields.length - 1}`).end.value &&
        plusChecker(saturdayFields, type))
    ) {
      saturdayFieldsAppend([
        {
          start: '',
          end: '',
        },
      ]);
      if (saturdayFields.length < 1) {
        try {
          await createTherapistWorkHour({
            type: type,
            start: '09:00 am',
            end: '05:00 pm',
            weekDay: 7,
          });
          toast.success('Changes saved');
        } catch (e: any) {
          toast.error(e);
        }
      } else {
        const index = timeData.findIndex(
          (item) =>
            item.value === saturdayFields[saturdayFields.length - 1].end.value,
        );
        try {
          await createTherapistWorkHour({
            type: type,
            start: timeData[index + 2]?.value?.replace('  ', ' '),
            end: timeData[index + 4]?.value?.replace('  ', ' '),
            weekDay: 7,
          });
          toast.success('Changes saved');
        } catch (e: any) {
          toast.error(e);
        }
      }
    }
  };
  const addSundayDate = async () => {
    if (
      !sundayFields.length ||
      (!!getValues(`sunday.${sundayFields.length - 1}`).end.value &&
        plusChecker(sundayFields, type))
    ) {
      sundayFieldsAppend([
        {
          start: '',
          end: '',
        },
      ]);
      if (sundayFields.length < 1) {
        try {
          await createTherapistWorkHour({
            type: type,
            start: '09:00 am',
            end: '05:00 pm',
            weekDay: 1,
          });
          toast.success('Changes saved');
        } catch (e: any) {
          toast.error(e);
        }
      } else {
        const index = timeData.findIndex(
          (item) =>
            item.value === sundayFields[sundayFields.length - 1].end.value,
        );
        try {
          await createTherapistWorkHour({
            type: type,
            start: timeData[index + 2]?.value?.replace('  ', ' '),
            end: timeData[index + 4]?.value?.replace('  ', ' '),
            weekDay: 1,
          });
          toast.success('Changes saved');
        } catch (e: any) {
          toast.error(e);
        }
      }
    }
  };

  useEffect(() => {
    if (data) {
      Object.entries(data)?.forEach(([key, value]) => {
        // @ts-ignore
        setValue(key, value);
      });
    }
  }, [data]);

  return (
    <form className={styles.wrapper}>
      <div className={styles.block}>
        <div className={styles.row}>
          <span className={styles.label}>Mondays</span>
          <i
            className={cn('icon-plus', styles.plusIcon)}
            onClick={addMondayDate}
          />
        </div>
        {mondayFields.map((el, idx) => {
          let nextStartIdx = 0;
          let prevEndIdx = 0;
          timeData.forEach((e, idx_) => {
            if (
              !!mondayFields[idx - 1] &&
              mondayFields[idx - 1]?.end?.value === e.value
            ) {
              prevEndIdx = idx_;
            }
            if (
              !!mondayFields[idx + 1] &&
              mondayFields[idx + 1]?.start?.value === e.value
            ) {
              nextStartIdx = idx_;
            }
          });
          const nextLimit = type === 1 ? nextStartIdx - 2 : nextStartIdx - 1;
          const startArray = timeData.slice(
            idx === 0 ? 0 : prevEndIdx,
            !!nextStartIdx ? nextLimit : type === 1 ? timeData.length - 2 : timeData.length - 1,
          );
          const lastItem = mondayFields.length === 1;
          return (
            <Controller
              key={el.id}
              name={`${DateControlDays.MONDAY}.${idx}`}
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <TimeControl
                    nextStartIdx={nextStartIdx}
                    lastItem={lastItem}
                    weekDay={WEEKDAYS.MONDAY}
                    type={type}
                    startSelectData={startArray}
                    key={el.id}
                    onChange={onChange}
                    value={value}
                    remove={() => mondayFieldsRemove(idx)}
                  />
                );
              }}
            />
          );
        })}
      </div>
      <div className={styles.block}>
        <div className={styles.row}>
          <span className={styles.label}>Tuesdays</span>
          <i
            className={cn('icon-plus', styles.plusIcon)}
            onClick={addTuesdayDate}
          />
        </div>
        {tuesdayFields.map((el, idx) => {
          let nextStartIdx = 0;
          let prevEndIdx = 0;
          timeData.forEach((e, idx_) => {
            if (
              !!tuesdayFields[idx - 1] &&
              tuesdayFields[idx - 1]?.end?.value === e.value
            ) {
              prevEndIdx = idx_;
            }
            if (
              !!tuesdayFields[idx + 1] &&
              tuesdayFields[idx + 1]?.start?.value === e.value
            ) {
              nextStartIdx = idx_;
            }
          });
          const nextLimit = type === 1 ? nextStartIdx - 2 : nextStartIdx - 1;
          const startArray = timeData.slice(
            idx === 0 ? 0 : prevEndIdx,
            !!nextStartIdx ? nextLimit : type === 1 ? timeData.length - 2 : timeData.length - 1,
          );
          const lastItem = tuesdayFields.length === 1;
          return (
            <Controller
              key={el.id}
              name={`${DateControlDays.TUESDAY}.${idx}`}
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <TimeControl
                    nextStartIdx={nextStartIdx}
                    lastItem={lastItem}
                    weekDay={WEEKDAYS.TUESDAY}
                    type={type}
                    startSelectData={startArray}
                    key={el.id}
                    onChange={onChange}
                    value={value}
                    remove={() => tuesdayFieldsRemove(idx)}
                  />
                );
              }}
            />
          );
        })}
      </div>
      <div className={styles.block}>
        <div className={styles.row}>
          <span className={styles.label}>Wednesdays</span>
          <i
            className={cn('icon-plus', styles.plusIcon)}
            onClick={addWednesdayDate}
          />
        </div>
        {wednesdayFields.map((el, idx) => {
          let nextStartIdx = 0;
          let prevEndIdx = 0;
          timeData.forEach((e, idx_) => {
            if (
              !!wednesdayFields[idx - 1] &&
              wednesdayFields[idx - 1]?.end?.value === e.value
            ) {
              prevEndIdx = idx_;
            }
            if (
              !!wednesdayFields[idx + 1] &&
              wednesdayFields[idx + 1]?.start?.value === e.value
            ) {
              nextStartIdx = idx_;
            }
          });
          const nextLimit = type === 1 ? nextStartIdx - 2 : nextStartIdx - 1;
          const startArray = timeData.slice(
            idx === 0 ? 0 : prevEndIdx,
            !!nextStartIdx ? nextLimit : type === 1 ? timeData.length - 2 : timeData.length - 1,
          );
          const lastItem = wednesdayFields.length === 1;
          return (
            <Controller
              key={el.id}
              name={`${DateControlDays.WEDNESDAY}.${idx}`}
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <TimeControl
                    nextStartIdx={nextStartIdx}
                    lastItem={lastItem}
                    weekDay={WEEKDAYS.WEDNESDAY}
                    type={type}
                    startSelectData={startArray}
                    key={el.id}
                    onChange={onChange}
                    value={value}
                    remove={() => wednesdayFieldsRemove(idx)}
                  />
                );
              }}
            />
          );
        })}
      </div>
      <div className={styles.block}>
        <div className={styles.row}>
          <span className={styles.label}>Thursdays</span>
          <i
            className={cn('icon-plus', styles.plusIcon)}
            onClick={addThursdayDate}
          />
        </div>
        {thursdayFields.map((el, idx) => {
          let nextStartIdx = 0;
          let prevEndIdx = 0;
          timeData.forEach((e, idx_) => {
            if (
              !!thursdayFields[idx - 1] &&
              thursdayFields[idx - 1]?.end?.value === e.value
            ) {
              prevEndIdx = idx_;
            }
            if (
              !!thursdayFields[idx + 1] &&
              thursdayFields[idx + 1]?.start?.value === e.value
            ) {
              nextStartIdx = idx_;
            }
          });
          const nextLimit = type === 1 ? nextStartIdx - 2 : nextStartIdx - 1;
          const startArray = timeData.slice(
            idx === 0 ? 0 : prevEndIdx,
            !!nextStartIdx ? nextLimit : type === 1 ? timeData.length - 2 : timeData.length - 1,
          );
          const lastItem = thursdayFields.length === 1;
          return (
            <Controller
              key={el.id}
              name={`${DateControlDays.THURSDAY}.${idx}`}
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <TimeControl
                    nextStartIdx={nextStartIdx}
                    lastItem={lastItem}
                    weekDay={WEEKDAYS.THURSDAY}
                    type={type}
                    startSelectData={startArray}
                    key={el.id}
                    onChange={onChange}
                    value={value}
                    remove={() => thursdayFieldsRemove(idx)}
                  />
                );
              }}
            />
          );
        })}
      </div>
      <div className={styles.block}>
        <div className={styles.row}>
          <span className={styles.label}>Fridays</span>
          <i
            className={cn('icon-plus', styles.plusIcon)}
            onClick={addFridayDate}
          />
        </div>
        {fridayFields.map((el, idx) => {
          let nextStartIdx = 0;
          let prevEndIdx = 0;
          timeData.forEach((e, idx_) => {
            if (
              !!fridayFields[idx - 1] &&
              fridayFields[idx - 1]?.end?.value === e.value
            ) {
              prevEndIdx = idx_;
            }
            if (
              !!fridayFields[idx + 1] &&
              fridayFields[idx + 1]?.start?.value === e.value
            ) {
              nextStartIdx = idx_;
            }
          });
          const nextLimit = type === 1 ? nextStartIdx - 2 : nextStartIdx - 1;
          const startArray = timeData.slice(
            idx === 0 ? 0 : prevEndIdx ,
            !!nextStartIdx ? nextLimit : type === 1 ? timeData.length - 2 : timeData.length - 1,
          );
          const lastItem = fridayFields.length === 1;
          return (
            <Controller
              key={el.id}
              name={`${DateControlDays.FRIDAY}.${idx}`}
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <TimeControl
                    nextStartIdx={nextStartIdx}
                    lastItem={lastItem}
                    weekDay={WEEKDAYS.FRIDAY}
                    type={type}
                    startSelectData={startArray}
                    key={el.id}
                    onChange={onChange}
                    value={value}
                    remove={() => fridayFieldsRemove(idx)}
                  />
                );
              }}
            />
          );
        })}
      </div>
      <div className={styles.block}>
        <div className={styles.row}>
          <span className={styles.label}>Saturdays</span>
          <i
            className={cn('icon-plus', styles.plusIcon)}
            onClick={addSaturdayDate}
          />
        </div>
        {saturdayFields.map((el, idx) => {
          let nextStartIdx = 0;
          let prevEndIdx = 0;
          timeData.forEach((e, idx_) => {
            if (
              !!saturdayFields[idx - 1] &&
              saturdayFields[idx - 1]?.end?.value === e.value
            ) {
              prevEndIdx = idx_;
            }
            if (
              !!saturdayFields[idx + 1] &&
              saturdayFields[idx + 1]?.start?.value === e.value
            ) {
              nextStartIdx = idx_;
            }
          });
          const nextLimit = type === 1 ? nextStartIdx - 2 : nextStartIdx - 1;
          const startArray = timeData.slice(
            idx === 0 ? 0 : prevEndIdx,
            !!nextStartIdx ? nextLimit : type === 1 ? timeData.length - 2 : timeData.length - 1,
          );
          const lastItem = saturdayFields.length === 1;
          return (
            <Controller
              key={el.id}
              name={`${DateControlDays.SATURDAY}.${idx}`}
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <TimeControl
                    nextStartIdx={nextStartIdx}
                    lastItem={lastItem}
                    weekDay={WEEKDAYS.SATURDAY}
                    type={type}
                    startSelectData={startArray}
                    key={el.id}
                    onChange={onChange}
                    value={value}
                    remove={() => saturdayFieldsRemove(idx)}
                  />
                );
              }}
            />
          );
        })}
      </div>
      <div className={styles.block}>
        <div className={styles.row}>
          <span className={styles.label}>Sundays</span>
          <i
            className={cn('icon-plus', styles.plusIcon)}
            onClick={addSundayDate}
          />
        </div>
        {sundayFields.map((el, idx) => {
          let nextStartIdx = 0;
          let prevEndIdx = 0;
          timeData.forEach((e, idx_) => {
            if (
              !!sundayFields[idx - 1] &&
              sundayFields[idx - 1]?.end?.value === e.value
            ) {
              prevEndIdx = idx_;
            }
            if (
              !!sundayFields[idx + 1] &&
              sundayFields[idx + 1]?.start?.value === e.value
            ) {
              nextStartIdx = idx_;
            }
          });
          const nextLimit = type === 1 ? nextStartIdx - 2 : nextStartIdx - 1;
          const startArray = timeData.slice(
            idx === 0 ? 0 : prevEndIdx,
            !!nextStartIdx ? nextLimit : type === 1 ? timeData.length - 2 : timeData.length - 1,
          );
          const lastItem = sundayFields.length === 1;
          return (
            <Controller
              key={el.id}
              name={`${DateControlDays.SUNDAY}.${idx}`}
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <TimeControl
                    nextStartIdx={nextStartIdx}
                    lastItem={lastItem}
                    weekDay={WEEKDAYS.SUNDAY}
                    type={type}
                    startSelectData={startArray}
                    key={el.id}
                    onChange={onChange}
                    value={value}
                    remove={() => sundayFieldsRemove(idx)}
                  />
                );
              }}
            />
          );
        })}
      </div>
    </form>
  );
};
export default DateControl;
