import {
  addMinutes,
  addMonths,
  eachDayOfInterval,
  eachHourOfInterval,
  endOfDay,
  endOfWeek,
  format,
  startOfDay,
  startOfWeek,
} from 'date-fns';

const currentDate = new Date();
const futureDate = addMonths(currentDate, 1);

const datesArray = eachDayOfInterval({ start: currentDate, end: futureDate });

/////-----Only Work-days-----/////
//const weekdaysArray = datesArray.filter((date) => !isWeekend(date));


const getHalfHourIntervals = (date:Date) => {
  const start = startOfDay(date);
  const end = endOfDay(date);

  const hours = eachHourOfInterval({ start, end });

  const halfHourIntervals:any = [];

  hours.forEach(hour => {
    halfHourIntervals.push(hour);
    const halfHour = addMinutes(hour, 30);
    if (halfHour <= end) {
      halfHourIntervals.push(halfHour);
    }
  });

  return halfHourIntervals;
};

const hoursArray = getHalfHourIntervals(currentDate);

export const formattedWeekdays = datesArray.map((date, idx) => {
  return {
    id: idx + 1,
    label: format(date, 'iii'),
    secondLabel: format(date, 'd'),
    month: format(date, 'MMM'),
  };
});

export const formattedHours = hoursArray.map((hour: string, idx:number) => {
  const formattedTime = format(hour, 'h').padStart(2, '0') // Pad hours with leading zeros
      + ':' + format(hour, 'mm') + ' ' + format(hour, 'a').toLowerCase();
  return { id: idx + 1, label: formattedTime.replaceAll(' ', '') };
});

const now = new Date();
const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 1 });

const startCurrentWeek = new Date(startOfCurrentWeek);
const endCurrentWeek = new Date(endOfCurrentWeek);
export const startTimestampCurrentWeek = startCurrentWeek.getTime();
export const endTimestampCurrentWeek = endCurrentWeek.getTime();

const nextMonth = new Date(now);
nextMonth.setMonth(nextMonth.getMonth() + 1);
export const startTimestampToday = now.getTime();
export const startTimestampNextMonth = nextMonth.getTime();
export const oneYearInMiliSeconds = 365 * 24 * 60 * 60 * 1000

export const formatDateToSec = (date:string)=>{
  return new Date(date).getTime() / 1000
}
