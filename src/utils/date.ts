import dayjs from 'dayjs';
import { Timestamp } from 'firebase/firestore';

export function toTimestamp(date: any): Timestamp {
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
