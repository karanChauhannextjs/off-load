import {
  MonthsShortToLong,
  SESSION_TYPE,
  WeekDaysShortToLong,
} from '@constants/constants.ts';
import {
  addHours,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  differenceInWeeks,
  differenceInYears,
  endOfWeek,
  format,
  FormatOptions,
  isAfter,
  parse,
  parseISO,
  startOfWeek,
} from 'date-fns';
import { IScheduleCard } from '@models/book.ts';

export const webBaseUrl = `${import.meta.env.VITE_APP_PROD_BASE_URL}`;
export const stageBaseUrl = `${import.meta.env.VITE_APP_STAGE_BASE_URL}`;
export const currentBaseUrl = `${import.meta.env.VITE_APP_STAGE_BASE_URL}`;
export const encodeDecodeSecretKey = `${import.meta.env.VITE_APP_ENCODE_DECODE_SECRET_KEY}`;
export const iosAppLink = `${import.meta.env.VITE_APP_IOS_APP_LINK}`;
export const androidAppLink = `${import.meta.env.VITE_APP_ANDROID_APP_LINK}`;
export const OwnerCalendlyLink = 'https://calendly.com/edwin-offload/20min';

export const modifyWord = (word: string) => {
  return (word[0]?.toUpperCase() + word?.slice(1))?.replace('-', ' ');
};

export const modifyWord2 = (word: string) => {
  return word
    ?.toLowerCase() // Convert the entire string to lowercase
    .split('_') // Split the string by underscores
    .map((word) => word?.charAt(0)?.toUpperCase() + word?.slice(1)) // Capitalize the first letter of each word
    .join(' ');
};

export const formatSecondsToMinutesAndSeconds = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const getTypeCall = (
  isInPerson?: boolean,
  isLiveText?: boolean,
  isVideoCall?: boolean,
  isVoiceCall?: boolean,
) => {
  if (isInPerson) return 'in-person';
  if (isLiveText) return 'live-text';
  if (isVideoCall) return 'video-call';
  if (isVoiceCall) return 'voice-call';
  return '';
};

export const getEnumKeysFromNumbers = (numbers: number[]): string[] => {
  return numbers.map((number) => {
    const enumKey = Object.keys(SESSION_TYPE).find(
      (key) => SESSION_TYPE[key as keyof typeof SESSION_TYPE] === number,
    );
    return enumKey || '';
  });
};

export const formatLink = (link?: string) => {
  if (!!link && !link.startsWith('https://')) {
    return `https://${link}`;
  }
  return link;
};

export const getTimezoneDifferenceInSeconds = () => {
  const currentDate = new Date();
  return currentDate.getTimezoneOffset() * 60;
};

export const combineDateTime = (dayObj: any, timeObj: any) => {
  // Create a string that represents the full date and time
  const dateString = `${dayObj?.label} ${dayObj?.month} ${dayObj?.secondLabel} ${new Date().getFullYear()} ${timeObj?.label}`;
  return parse(dateString, 'EEE MMM d yyyy h:mma', new Date());
};

// Define a custom format function for the day suffix (1st, 2nd, 3rd, etc.)
export const formatWithSuffix = (
  date: Date,
  formatString: string,
  options: FormatOptions | undefined,
) => {
  const formattedDate = format(date, formatString, options);
  const day = format(date, 'd');
  // @ts-ignore
  const suffix = ['th', 'st', 'nd', 'rd'][(day % 10) - 1] || 'th';
  return formattedDate.replace('do', `${day}${suffix}`);
};

export const timeToDateConverter = (day: string, time: string) => {
  const currentYear = new Date().getFullYear();
  const dateTimeString = `${day} ${currentYear} ${time}`;
  const dateTime = new Date(dateTimeString);
  return Math.floor(dateTime.getTime());
};

export const timeToLongFormat = (day?: string, time?: string) => {
  const currentYear = new Date().getFullYear();
  const dateTimeString = `${day} ${currentYear} ${time}`;

  // Parse the combined date-time string
  const parsedDate = parse(dateTimeString, 'd MMM yyyy h:mm a', new Date());

  // Convert the date to GMT
  const gmtDate = new Date(
    parsedDate.toLocaleString('en-US', { timeZone: 'GMT' }),
  );

  // Format the date into the desired string format
  //TODO format without gmt, local time
  // return format(gmtDate, "h:mma, EEEE, MMMM do '(GMT)'");
  return format(gmtDate, ' EEEE, MMMM do');
};

export const timeToLongFormat2 = (day?: string, time?: string) => {
  const currentYear = new Date().getFullYear();
  const dateTimeString = `${day} ${currentYear} ${time}`;

  // Parse the combined date-time string
  const parsedDate = parse(dateTimeString, 'd MMM yyyy h:mm a', new Date());

  // Convert the date to GMT
  const gmtDate = new Date(
    parsedDate.toLocaleString('en-US', { timeZone: 'GMT' }),
  );

  // Format the date into the desired string format
  //TODO format without gmt, local time
  // return format(gmtDate, " EEEE, MMMM do");
  return format(gmtDate, "h:mma, EEEE, MMMM do '(GMT)'");
};

export const getInitialsLetters = (name: string) => {
  const nameParts = name?.split(' ');
  const initials = nameParts
    ?.slice(0, 2)
    ?.map((part) => part?.charAt(0))
    ?.join('');
  return initials?.toUpperCase();
};

export const plusChecker = (data: any[], type?: number) => {
  const lastEndValue = data?.[data.length - 1]?.end?.value?.replace('  ', ' ');
  return type === 1 || type === 2
    ? !['10:30 pm', '11:00 pm', '11:30 pm', '12:00 am'].includes(lastEndValue)
    : !['11:00 pm', '11:30 pm', '12:00 am'].includes(lastEndValue);
};

export const dateFormatter2 = (timestamp: number) => {
  const date = new Date(timestamp);
  // Define options for the desired format
  const options = { month: 'long', day: 'numeric' };
  // @ts-ignore
  const formattedDate = date.toLocaleDateString('en-US', options);
  // Add "th", "st", "nd", or "rd" to the day
  const day = date.getDate();
  let suffix;
  if (day > 3 && day < 21) suffix = 'th';
  else if (day % 10 === 1) suffix = 'st';
  else if (day % 10 === 2) suffix = 'nd';
  else if (day % 10 === 3) suffix = 'rd';
  else suffix = 'th';
  // @ts-ignore
  return formattedDate.replace(day, `${day}${suffix}`);
};

export const extractUsername = (string: string) => {
  const match = string.match(/_(.*?)@/);
  if (match && match[1]) {
    return match[1];
  }
};

export const getFileType = (fileName: string) => {
  return fileName?.split('.').pop();
};

export const truncateFileName = (fileName: string, maxLength: number = 15) => {
  const parts = fileName.split('.');
  if (parts.length < 2) return fileName; // No extension found

  const extension = parts.pop();
  const name = parts.join('.');

  if (name.length > maxLength) {
    return `${name.slice(0, maxLength)}...${extension}`;
  } else return fileName;
};

export const checkUrlAfterProtocol = (url: string) => {
  if (url.startsWith('http://')) {
    const remainder = url.substring(7); // Remove 'http://'
    return `https://${remainder}`;
  } else if (url.startsWith('https://')) {
    return url;
  } else {
    return url;
  }
};

export const generateRandomString = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

export const getNextSessions = (sessions: string[], currentTime: string) => {
  const currentTimeParsed = parse(currentTime, 'hh:mm a', new Date());
  const fourHoursLater = addHours(currentTimeParsed, 4);
  return sessions?.filter((session) => {
    const sessionTimeParsed = parse(session, 'hh:mm a', new Date());
    return isAfter(sessionTimeParsed, fourHoursLater);
  });
};

export const getWeekRange = (date: any) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return `${format(start, 'dd MMM')} - ${format(end, 'dd MMM')}`;
};

export const areMessagesOnSameDay = (messages: any) => {
  if (messages.length === 0) return true;
  const firstDate = new Date(messages[0].time).toDateString();
  return messages.every((message: any) => {
    const currentDate = new Date(message.time).toDateString();
    return currentDate === firstDate;
  });
};

export function getLongDay(shortDay: string | undefined) {
  // @ts-ignore
  return WeekDaysShortToLong[shortDay] || shortDay;
}

export function getLongMonth(shortMonth: string | undefined) {
  // @ts-ignore
  return MonthsShortToLong[shortMonth] || shortMonth;
}

export const upcomingSessionsReader = (data: IScheduleCard[]) =>
  data?.filter(({ date }) => Date.now() <= date * 1000) || [];

export const getCurrentDate = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

export const hasTypeData = (
  array: any[],
  type: 'sessions' | 'consultations',
) => {
  return array?.some(
    (item) =>
      Array.isArray(item?.ranges?.[type]) && item?.ranges?.[type]?.length > 0,
  );
};

export const isIphone = () => {
  return /iPhone/i.test(navigator.userAgent);
};

export const getWeekTimestamps = (weekOffset: number) => {
  const now = new Date();
  const day = now.getDay(); // Get the current day (0 = Sunday, 1 = Monday, ...)
  const diffToMonday = (day === 0 ? -6 : 1) - day; // Adjust to make Monday the first day of the week

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + diffToMonday + weekOffset * 7);
  startOfWeek.setHours(0, 0, 1, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    startTimestamp:
      startOfWeek.getTime() - getTimezoneDifferenceInSeconds() * 1000,
    endTimestamp: endOfWeek.getTime() - getTimezoneDifferenceInSeconds() * 1000,
  };
};

export const transformData = (
  feelingAverage: any,
) => {
  const lastWeekDays = feelingAverage?.lastWeek?.days;
  const currentWeekDays = feelingAverage?.currentWeek?.days;
  const futureWeekDays = feelingAverage?.futureWeek?.days;
  const prevLastWeekdays = feelingAverage?.prevLastWeek?.days;

  const dayAbbreviations = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const lastValidItemCr = [...lastWeekDays]
    .reverse()
    .find((dayItem) => dayItem.average);
  const lastWeekLastPr = [...currentWeekDays].find(
    (dayItem) => dayItem.average,
  );
  const currentLastItem = [...futureWeekDays].find(
    (dayItem) => dayItem.average,
  );
  const prevLastItem = [...prevLastWeekdays]
    .reverse()
    .find((dayItem) => dayItem.average);

  const firstItem = lastWeekDays
    ?.slice(-1)
    ?.map((dayItem: any, index: number) => ({
      cr: lastValidItemCr ? lastValidItemCr.average * 1000 : null,
      pr: prevLastItem ? prevLastItem.average * 1000 : null,
      value: dayItem.average,
      index: 0,
      date: format(parseISO(dayItem.day), 'MMM dd'),
      d: dayAbbreviations[index],
    }))[0];

  const currentWeekItems = currentWeekDays?.map(
    (dayItem: any, index: number) => ({
      cr: dayItem.average * 1000 || null,
      pr: lastWeekDays[index]?.average * 1000 || null, // Previous week's average
      value: dayItem.average,
      index: index + 1, // Increment index
      date: format(parseISO(dayItem.day), 'MMM dd'),
      d: dayAbbreviations[index],
    }),
  );

  const lastItem = {
    cr: currentLastItem ? currentLastItem.average * 1000 : null,
    pr: lastWeekLastPr ? lastWeekLastPr.average * 1000 : null,
    value: null,
    index: 8,
    date: null,
    d: null,
  };

  return [firstItem, ...currentWeekItems, lastItem];
};

export const formatDate = (dateString: string) => {
  const parsedDate = parse(dateString, 'MM/dd/yyyy', new Date());
  return format(parsedDate, 'MMMM do');
};

export const isNumberIncluded = (scores: any[], num: number) => {
  return scores.some(
    ({ from, to }) => (from === 0 || num >= from) && num <= to,
  );
};

export const redirectToAppStore = () => {
  // @ts-ignore
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/android/i.test(userAgent)) {
    // Redirect to Google Play Store
    window.location.href = androidAppLink;

    // @ts-ignore
  } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    // Redirect to Apple App Store
    window.location.href = iosAppLink;
  } else {
    alert('Please visit the app store on your mobile device.');
  }
};
export const formatTimeDifference = (date: string) => {
  const now = new Date();
  const givenDate = new Date(date);

  const seconds = differenceInSeconds(now, givenDate);
  if (seconds < 60) return `${seconds}s`;

  const minutes = differenceInMinutes(now, givenDate);
  if (minutes < 60) return `${minutes}m`;

  const hours = differenceInHours(now, givenDate);
  if (hours < 24) return `${hours}h`;

  const days = differenceInDays(now, givenDate);
  if (days < 7) return `${days}d`;

  const weeks = differenceInWeeks(now, givenDate);
  if (weeks < 4) return `${weeks}w`;

  const months = differenceInMonths(now, givenDate);
  if (months < 12) return `${months}mo`;

  const years = differenceInYears(now, givenDate);
  return `${years}y`;
};

export const getYouTubeEmbedUrl = (url: string) => {
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([0-9a-zA-Z\-_]{11})/;
  const match = url.match(regex);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
};

export const getYouTubeThumbnail = (url?: string, quality: string = 'maxresdefault') => {
  if(!url) {
    return;
  }

  try {
    const urlObj = new URL(url);
    let videoId = null;

    // Handle different YouTube URL formats
    if (urlObj.hostname.includes('youtube.com')) {
      // Standard URL with query parameter (e.g., youtube.com/watch?v=TLpFz3OQe4g)
      if (urlObj.searchParams.get('v')) {
        videoId = urlObj.searchParams.get('v');
      }
      // Shorts URL (e.g., youtube.com/shorts/-opvAkvn2NM)
      else if (urlObj.pathname.startsWith('/shorts/')) {
        videoId = urlObj.pathname.split('/shorts/')[1]?.split('?')[0];
      }
      // Embed URL or other paths (e.g., youtube.com/embed/TLpFz3OQe4g)
      else {
        const pathParts = urlObj.pathname.split('/');
        videoId = pathParts[pathParts.length - 1]; // Last part of the path
      }
    } else if (urlObj.hostname.includes('youtu.be')) {
      // Short URL (e.g., youtu.be/TLpFz3OQe4g)
      videoId = urlObj.pathname.split('/')[1]?.split('?')[0];
    }

    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
    }
    return null;
  } catch (error) {
    return null;
  }
};
