import { Button } from '@shared/ui';
import styles from './OverrideForm.module.scss';
import { TimeControl } from '@features/index.ts';
import { timeData } from '@constants/date.ts';
import * as yup from 'yup';
import { schema } from './OverrideForm.validation.ts';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect } from 'react';
import {
  OVERRIDE_DAY,
  OverrideFormProps,
} from '@widgets/OverrideForm/OverrideForm.types.ts';
import {plusChecker} from "@utils/helpers.ts";

export type FormData = yup.InferType<typeof schema>;

const OverrideForm: React.FC<OverrideFormProps> = (props) => {
  const { day, data } = props;

  const {
    setValue,
    getValues,
    control,
    formState: {},
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const {
    fields: overrideFields,
    append: overrideFieldsAppend,
    remove: overrideFieldsRemove,
  } = useFieldArray({
    control,
    name: OVERRIDE_DAY.OVERRIDE,
  });

  const onAddOverride = () => {
    if (
      !overrideFields.length ||
        (!!getValues(`override.${overrideFields.length - 1}`).end.value && plusChecker(overrideFields))
    ) {
      overrideFieldsAppend([
        {
          start: '',
          end: '',
          uuid: '',
        },
      ]);
    }
  };

  useEffect(() => {
    if (data) {
      Object.entries(data)?.forEach(([key, value]) => {
        // @ts-ignore
        setValue(key, value);
      });
    }
  }, [data, day]);

  return (
    <div className={styles.wrapper}>
      {!!day && (
        <Button
          className={styles.button}
          icon={'plus'}
          label={'Add override'}
          variant={'tertiary'}
          onClick={onAddOverride}
        />
      )}
      <form className={styles.form}>
        {overrideFields.map((el, idx) => {
          let nextStartIdx = 0;
          let prevEndIdx = 0;
          timeData.forEach((e, idx_) => {
            if (
                !!overrideFields[idx - 1] &&
                overrideFields[idx - 1]?.end?.value === e.value
            ) {overrideFields
              prevEndIdx = idx_;
            }
            if (
                !!overrideFields[idx + 1] &&
                overrideFields[idx + 1]?.start?.value === e.value
            ) {
              nextStartIdx = idx_;
            }
          });
          const startArray = timeData.slice(
              idx === 0 ? 0 : prevEndIdx + 1,
              !!nextStartIdx ? nextStartIdx - 1 : timeData.length -1,
          );
          const lastItem = overrideFields.length === 1;
          return (
            <Controller
              key={el.id}
              name={`${OVERRIDE_DAY.OVERRIDE}.${idx}`}
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <TimeControl
                    nextStartIdx={nextStartIdx}
                    day={day}
                    lastItem={lastItem}
                    startSelectData={startArray}
                    key={el.id}
                    onChange={onChange}
                    value={value}
                    remove={() => overrideFieldsRemove(idx)}
                  />
                );
              }}
            />
          );
        })}
      </form>
    </div>
  );
};
export default OverrideForm;
