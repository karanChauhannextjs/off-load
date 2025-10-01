import React, { useEffect, useState } from 'react';
import cn from 'classnames';

import styles from './TimeControl.module.scss';
import { timeData } from '@constants/date.ts';
import Select, { OptionType } from '@shared/ui/Select';
import { useAvailability } from '@store/availability.ts';
import { TimeControlProps } from '@features/TimeControl/TimeControl.types.ts';
import { formatDateToSec } from '@constants/daysAndTime.ts';
import  toast  from "react-hot-toast";

const TimeControl: React.FC<TimeControlProps> = (props) => {
  const {
    value,
    type,
    day,
    weekDay,
    onChange,
    remove,
    startSelectData,
    lastItem,
    nextStartIdx,
  } = props;
  const [endSelectData, setEndSelectData] = useState<OptionType[]>([]);

  const createTherapistWorkHour = useAvailability(
    (state) => state.createTherapistWorkHour,
  );
  const updateTherapistWorkHour = useAvailability(
    (state) => state.updateTherapistWorkHour,
  );
  const deleteTherapistWorkHour = useAvailability(
    (state) => state.deleteTherapistWorkHour,
  );

  const overrideHour = useAvailability((state) => state.overrideHour);

  const updateOverrideHour = useAvailability(
    (state) => state.updateOverrideHour,
  );
  const deleteOverrideHour = useAvailability(
    (state) => state.deleteOverrideHour,
  );
  const handleStart = async (e: OptionType) => {
    let startIdx = 0;
    let endIdx = 0;
    timeData.forEach((time: any, idx: number) => {
      if (e.value === time.value) {
        startIdx = idx;
      }
      if (value?.end?.value === time.value) {
        endIdx = idx;
      }
    });

    if (type === 1 && startIdx + 1 >= endIdx) {
      onChange({ ...value, start: e, end: null });
    } else if ((type === 2 || !type) && startIdx >= endIdx) {
      onChange({ ...value, start: e, end: null });
    } else {
      onChange({ ...value, start: e });
    }

    const body = {
      uuid: value?.uuid,
      start: String(e?.value)?.replace('  ', ' '),
      end: value?.end?.value?.replace('  ', ' '),
    };
    try {
      if (!!value.uuid && type === 1 && !(startIdx + 1 >= endIdx)) {
        //Update Session or Consultation Hour//
        await updateTherapistWorkHour(body);
        toast.success('Changes saved');
      }else if (!!value.uuid && type === 2 && !(startIdx >= endIdx)) {
        //Update Session or Consultation Hour//
        await updateTherapistWorkHour(body);
        toast.success('Changes saved');
      } else if (!!value.uuid && !type && !(startIdx>= endIdx)) {
        //Update Override Hour//
        await updateOverrideHour(body);
        toast.success('Changes saved');
      }
    } catch (e: any) {
      toast.error(e);
    }
  };

  const handleEnd = async (e: OptionType) => {
    onChange({ ...value, end: e });
    try {
      const body = {
        uuid: value.uuid,
        start: value?.start?.value?.replace('  ', ' '),
        end: String(e.value)?.replace('  ', ' '),
      };
      if (!!value.uuid && !!type) {
        //Update Session or Consultation Hour//
        await updateTherapistWorkHour(body);
        toast.success('Changes saved');
      } else if (!!type && !!weekDay) {
        const body = {
          type,
          weekDay,
          start: value?.start?.value?.replace('  ', ' '),
          end: String(e.value)?.replace('  ', ' '),
        };
        await createTherapistWorkHour(body);
          toast.success('Changes saved');
      } else if (!!value.uuid && !type) {
        //Update Override Hour//
        await updateOverrideHour(body);
        toast.success('Changes saved');
      } else if (!type && !value.uuid && !!day) {
        //Override New Hour//
        const body = {
          date: formatDateToSec(day),
          start: value?.start?.value?.replace('  ', ' '),
          end: String(e.value)?.replace('  ', ' '),
        };
        await overrideHour(body);
        toast.success('Changes saved');
      }
    } catch (e: any) {
      toast.error(e);
    }
  };

  const removeTime = async () => {
    remove();
    try {
      if (!!value.uuid && !!type) {
        //Delete Session or Consultation Hour//
        await deleteTherapistWorkHour(
          value.uuid,
          lastItem ? value.dayUUID : null,
        );
        toast.success('Changes saved');
      } else if (!!value.uuid && !type) {
        // Delete Override Hour//
        await deleteOverrideHour(value.uuid, lastItem ? value.dayUUID : null);
        toast.success('Changes saved');
      }
    } catch (e: any) {
      toast.error(e);
    }
  };

  useEffect(() => {
    timeData.forEach((e, idx) => {
      if (value?.start?.value === e.value) {
        setEndSelectData(
          timeData.slice(
            type === 1 ? idx + 2 : idx + 1,
            !!nextStartIdx ? nextStartIdx+1 : timeData.length,
          ),
        );
      }
    });
  }, [value]);

  return (
    <>
      <div className={styles.selectRow}>
        <Select
          withoutArrow
          value={value?.start}
          onChange={handleStart}
          data={startSelectData ? startSelectData : []}
        />
        <span className={styles.line}>-</span>
        <Select
          disabled={!value?.start}
          withoutArrow
          value={value?.end}
          onChange={handleEnd}
          data={endSelectData}
        />
        <i className={cn('icon-bin', styles.binIcon)} onClick={removeTime} />
      </div>
    </>
  );
};
export default TimeControl;
