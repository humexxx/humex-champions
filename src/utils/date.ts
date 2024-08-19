import dayjs, { Dayjs, isDayjs } from 'dayjs';
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

export function isInSameMonth(dayA: Dayjs, dayB: Dayjs | null | undefined) {
  if (dayB == null) {
    return false;
  }

  return dayA.isSame(dayB, 'month');
}

export function isInSameWeek(dayA: Dayjs, dayB: Dayjs | null | undefined) {
  if (dayB == null) {
    return false;
  }

  return dayA.isSame(dayB, 'week');
}

export function isSameDay(dayA: Dayjs, dayB: Dayjs | null | undefined) {
  if (dayB == null) {
    return false;
  }

  return dayA.isSame(dayB, 'day');
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
    !isDayjs(obj)
  ) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = objectDateConverter(obj[key], converter);
      return acc;
    }, {} as any);
  } else if (
    obj instanceof Date ||
    obj instanceof Timestamp ||
    isDayjs(obj) ||
    (typeof obj === 'string' && !isNaN(Date.parse(obj)))
  ) {
    return converter(obj);
  } else {
    return obj;
  }
}
