import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Timestamp } from 'firebase/firestore';

export function toTimestamp(date: any): Timestamp {
  if (!date) return date;
  if (date instanceof Timestamp) {
    return date;
  } else if (date instanceof Date) {
    return Timestamp.fromDate(date);
  } else if (dayjs.isDayjs(date)) {
    return Timestamp.fromDate(date.toDate());
  }
  if (typeof date === 'string') {
    return Timestamp.fromDate(new Date(date));
  }
  throw new Error('Invalid date type');
}

export function toDayjs(date: any): Dayjs {
  if (!date) return date;
  if (date instanceof dayjs) {
    return date as Dayjs;
  } else if (date instanceof Date) {
    return dayjs(date);
  } else if (date instanceof Timestamp) {
    return dayjs(date.toDate());
  }
  throw new Error('Invalid date type');
}

export function isFirstDayOfWeek(date: Dayjs) {
  return date.day() === 0;
}

export function isLastDayOfWeek(date: Dayjs) {
  return date.day() === 6;
}

export function isFirstDayOfMonth(date: Dayjs) {
  return date.date() === 1;
}

export function isLastDayOfMonth(date: Dayjs) {
  return date.date() === date.daysInMonth();
}

dayjs.extend(customParseFormat);
export function objectDateConverter(
  obj: any,
  converter: (value: any) => any
): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => objectDateConverter(item, converter));
  } else if (
    obj !== null &&
    typeof obj === 'object' &&
    !(obj instanceof Timestamp) &&
    !dayjs.isDayjs(obj)
  ) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = objectDateConverter(obj[key], converter);
      return acc;
    }, {} as any);
  } else if (
    obj instanceof Date ||
    obj instanceof Timestamp ||
    dayjs.isDayjs(obj) ||
    (typeof obj === 'string' && dayjs(obj, 'YYYY-MM-DD', true).isValid())
  ) {
    return converter(obj);
  } else {
    return obj;
  }
}

export function getFullTimezone() {
  const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offsetInMinutes = -new Date().getTimezoneOffset();
  const offsetInHours = (offsetInMinutes / 60).toFixed(2);
  const offsetDisplay = `UTC${Number(offsetInHours) >= 0 ? '+' : ''}${offsetInHours}`;
  return `${currentTimeZone} (${offsetDisplay})`;
}

export function getNextQuarterDate(date: Date): Date {
  const currentDate = new Date() > date ? new Date() : date;
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const nextQuarterMonth =
    currentMonth < 3 ? 3 : currentMonth < 6 ? 6 : currentMonth < 9 ? 9 : 0;

  const nextQuarterYear =
    nextQuarterMonth === 0 ? currentYear + 1 : currentYear;

  return new Date(nextQuarterYear, nextQuarterMonth, 1);
}
