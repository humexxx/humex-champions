import { useMemo } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import AddIcon from '@mui/icons-material/Add';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { LoadingButton } from '@mui/lab';
import {
  TextField,
  Autocomplete,
  Checkbox,
  Stack,
  Box,
  Skeleton,
  Chip,
} from '@mui/material';
import { ELabelColorType } from '@shared/enums/ELabelColorType';
import { IPlanner } from '@shared/models/uplift';
import { Dayjs } from 'dayjs';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import LabelsDialog from './LabelsDialog';
import { UseUplift } from '../../hooks/useUplift';
import { usePlannerSetter } from '../hooks';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function DailyChecklistForm({
  planner,
  uplift,
}: {
  planner: IPlanner<Dayjs>;
  uplift: UseUplift;
}) {
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      yup.object().shape({
        title: yup
          .string()
          .nonNullable()
          .required(t('commonValidations.required')),
        labels: yup
          .array()
          .of(
            yup.object().shape({
              title: yup.string().default(''),
              color: yup
                .string()
                .oneOf(Object.values(ELabelColorType))
                .default(ELabelColorType.PRIMARY),
            })
          )
          .default([]),
      }),
    [t]
  );

  const { set, error, loading } = usePlannerSetter();

  const { register, handleSubmit, reset, setFocus, setValue } = useForm<
    yup.InferType<typeof schema>
  >({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      labels: [],
    },
  });

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    planner.items.push({
      title: data.title,
      completed: false,
      labels: data.labels,
    });
    await set(planner);
    reset();
    setTimeout(() => setFocus('title'), 0);
  };

  return (
    <Stack component={'form'} onSubmit={handleSubmit(onSubmit)} gap={2}>
      <TextField
        label={t('uplift.planner.form.newTask')}
        {...register('title')}
        error={!!error}
        helperText={error}
        fullWidth
        disabled={loading}
        size="small"
        variant={'outlined'}
      />
      <Box sx={{ flex: 1 }} position={'relative'}>
        <Autocomplete
          multiple
          options={uplift.data?.labels ?? []}
          loading={uplift.loading || true}
          disableCloseOnSelect
          getOptionLabel={(option) => option.title}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.title}
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Labels"
              placeholder="Labels"
              size="small"
              variant="outlined"
              fullWidth
              disabled={uplift.loading}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  label={option.title}
                  size="small"
                  color={option.color as any}
                  sx={{
                    py: '14px',
                    pl: '4px',
                    '& .MuiSvgIcon-root': {
                      fontSize: '22px',
                    },
                  }}
                  {...tagProps}
                />
              );
            })
          }
          onChange={(_, value) => {
            setValue('labels', value);
          }}
        />
        <Box position={'absolute'} left={-48} top={0}>
          {uplift.loading ? (
            <Skeleton variant="circular" width={40} height={40} />
          ) : (
            <LabelsDialog uplift={uplift} />
          )}
        </Box>
      </Box>
      <Stack direction="row" spacing={1} justifyContent={'end'}>
        <LoadingButton
          type="submit"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Submit
        </LoadingButton>
      </Stack>
    </Stack>
  );
}

export default DailyChecklistForm;
