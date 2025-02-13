import dayjs, { Dayjs } from 'dayjs';
import * as yup from 'yup';

export const yupDayjs: yup.MixedSchema<Dayjs | null | undefined> = yup
  .mixed<Dayjs>()
  .transform((value) => {
    return value ? dayjs(value) : null;
  })
  .test('is-dayjs', 'Invalid date', (value) => {
    return !value || dayjs.isDayjs(value);
  });
