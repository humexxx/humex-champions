import { alpha, styled } from '@mui/material';
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
  isSameDay,
} from 'src/utils';

type Props = {
  filter: 'day' | 'week' | 'month';
  day: Dayjs;
  onChange: (day: Dayjs) => void;
  isNegative: boolean;
  hasNoTrades: boolean;
};

const Calendar = ({
  filter,
  day,
  onChange,
  isNegative,
  hasNoTrades,
}: Props) => {
  const [hoveredDay, setHoveredDay] = useState<Dayjs | null>(null);
  return (
    <DateCalendar
      displayWeekNumber
      showDaysOutsideCurrentMonth
      disableFuture
      value={day}
      onChange={onChange}
      slots={{
        day: (props) => (
          <Day
            {...props}
            filter={filter}
            isNegative={isNegative}
            hasNoTrades={hasNoTrades}
          />
        ),
      }}
      slotProps={{
        day: (ownerState) =>
          ({
            selectedDay: day,
            hoveredDay,
            onPointerEnter: () => setHoveredDay(ownerState.day),
            onPointerLeave: () => setHoveredDay(null),
          }) as any,
      }}
      sx={{
        '& .MuiDayCalendar-header span': {
          width: 33,
        },
      }}
    />
  );
};

function Day(
  props: PickersDayProps<Dayjs> & {
    selectedDay?: Dayjs | null;
    hoveredDay?: Dayjs | null;
    filter: 'day' | 'week' | 'month';
    isNegative: boolean;
    hasNoTrades: boolean;
  }
) {
  const {
    day,
    selectedDay,
    hoveredDay,
    filter,
    isNegative,
    hasNoTrades,
    ...other
  } = props;

  return filter === 'day' ? (
    <CustomPickersDay
      {...other}
      day={day}
      sx={{ px: 2.5 }}
      disableMargin
      selected={false}
      isSelected={isSameDay(day, selectedDay)}
      isHovered={isSameDay(day, hoveredDay)}
      isFirstFromGroup
      isLastFromGroup
      isNegative={isNegative}
      hasNoTrades={hasNoTrades}
    />
  ) : filter === 'week' ? (
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
      isNegative={isNegative}
      hasNoTrades={hasNoTrades}
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
      isNegative={isNegative}
      hasNoTrades={hasNoTrades}
    />
  );
}

interface CustomPickerDayProps extends PickersDayProps<Dayjs> {
  isSelected: boolean;
  isHovered: boolean;
  isFirstFromGroup: boolean;
  isLastFromGroup: boolean;
  isNegative: boolean;
  hasNoTrades: boolean;
}

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) =>
    prop !== 'isSelected' &&
    prop !== 'isHovered' &&
    prop !== 'isFirstFromGroup' &&
    prop !== 'isLastFromGroup' &&
    prop !== 'isNegative' &&
    prop !== 'hasNoTrades',
})<CustomPickerDayProps>(
  ({
    theme,
    isSelected,
    isHovered,
    day,
    isFirstFromGroup,
    isLastFromGroup,
    isNegative,
    hasNoTrades,
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
      backgroundColor: hasNoTrades
        ? alpha(theme.palette.action.disabled, 0.05)
        : isNegative
          ? alpha(theme.palette.error.light, 0.2)
          : alpha(theme.palette.success.light, 0.2),

      color: theme.palette.text.primary,
      '&:focus, &:hover': {
        backgroundColor: hasNoTrades
          ? alpha(theme.palette.action.disabled, 0.05)
          : isNegative
            ? alpha(theme.palette.error.light, 0.2)
            : alpha(theme.palette.success.light, 0.2),
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
      border: '0 !important',
      position: 'relative',
      '&:before': {
        borderRadius: '50%',
        border: '1px solid rgba(0, 0, 0, 0.6)',
        content: '""',
        position: 'absolute',
        width: 'calc(100% - 1px)',
        height: 'calc(100% - 1px)',
      },
    }),
    padding: '0 !important',
  })
) as React.ComponentType<CustomPickerDayProps>;

export default Calendar;
