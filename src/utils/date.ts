import dayjs from 'dayjs';
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

export function toDayjs(date: any): dayjs.Dayjs {
  if (!date) return date;
  if (date instanceof dayjs) {
    return date as dayjs.Dayjs;
  } else if (date instanceof Date) {
    return dayjs(date);
  } else if (date instanceof Timestamp) {
    return dayjs(date.toDate());
  }
  throw new Error('Invalid date type');
}
