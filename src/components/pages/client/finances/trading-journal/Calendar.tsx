import { styled } from '@mui/material';
import { DateCalendar, PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import {
  isFirstDayOfMonth,
  isFirstDayOfWeek,
  isInSameMonth,
  isInSameWeek,
  isLastDayOfMonth,
  isLastDayOfWeek,
} from 'src/utils';

type Props = {
  filter: 'day' | 'week' | 'month';
  day: Dayjs;
  onChange: (day: Dayjs) => void;
};

const Calendar = ({ filter, day, onChange }: Props) => {
  const [hoveredDay, setHoveredDay] = useState<Dayjs | null>(null);
  return (
    <DateCalendar
      displayWeekNumber
      showDaysOutsideCurrentMonth
      disableFuture
      value={day}
      onChange={onChange}
      {...(filter !== 'day' && {
        slots: { day: (props) => <Day {...props} filter={filter} /> },
        slotProps: {
          day: (ownerState) =>
            ({
              selectedDay: day,
              hoveredDay,
              onPointerEnter: () => setHoveredDay(ownerState.day),
              onPointerLeave: () => setHoveredDay(null),
            }) as any,
        },
      })}
    />
  );
};

function Day(
  props: PickersDayProps<Dayjs> & {
    selectedDay?: Dayjs | null;
    hoveredDay?: Dayjs | null;
    filter: 'week' | 'month';
  }
) {
  const { day, selectedDay, hoveredDay, filter, ...other } = props;

  return filter === 'week' ? (
    <CustomPickersDay
      {...other}
      day={day}
      sx={{ px: 2.5 }}
      disableMargin
      selected={false}
      isSelected={isInSameWeek(day, selectedDay)}
      isHovered={isInSameWeek(day, hoveredDay)}
      isFirstFromGroup={isFirstDayOfWeek(day)}
      isLastFromGroup={isLastDayOfWeek(day)}
    />
  ) : (
    <CustomPickersDay
      {...other}
      day={day}
      sx={{ px: 2.5 }}
      disableMargin
      selected={false}
      isSelected={isInSameMonth(day, selectedDay)}
      isHovered={isInSameMonth(day, hoveredDay)}
      isFirstFromGroup={isFirstDayOfMonth(day) || isFirstDayOfWeek(day)}
      isLastFromGroup={isLastDayOfMonth(day) || isLastDayOfWeek(day)}
    />
  );
}

interface CustomPickerDayProps extends PickersDayProps<Dayjs> {
  isSelected: boolean;
  isHovered: boolean;
  isFirstFromGroup: boolean;
  isLastFromGroup: boolean;
  isNegative?: boolean;
}

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) =>
    prop !== 'isSelected' &&
    prop !== 'isHovered' &&
    prop !== 'isFirstFromGroup' &&
    prop !== 'isLastFromGroup' &&
    prop !== 'isNegative',
})<CustomPickerDayProps>(
  ({
    theme,
    isSelected,
    isHovered,
    day,
    isFirstFromGroup,
    isLastFromGroup,
    isNegative,
  }) => ({
    borderRadius: 0,

    ...(isHovered &&
      !isSelected && {
        backgroundColor: 'rgba(25, 118, 210, 0.04)',
        '&:hover, &:focus': {
          backgroundColor: 'rgba(25, 118, 210, 0.04)',
        },
      }),
    ...(isSelected && {
      backgroundColor: isNegative
        ? theme.palette.error.light
        : theme.palette.success.light,

      color: theme.palette.primary.contrastText,
      '&:focus, &:hover': {
        backgroundColor: isNegative
          ? theme.palette.error.light
          : theme.palette.success.light,
      },
    }),
    ...(isFirstFromGroup && {
      borderTopLeftRadius: '50%',
      borderBottomLeftRadius: '50%',
    }),
    ...(isLastFromGroup && {
      borderTopRightRadius: '50%',
      borderBottomRightRadius: '50%',
    }),
    ...(dayjs().isSame(day, 'date') &&
      !isHovered &&
      !isSelected && {
        borderRadius: '50%',
      }),
    ...(dayjs().isSame(day, 'date') && {
      padding: '0 !important',
    }),
  })
) as React.ComponentType<CustomPickerDayProps>;

export default Calendar;
