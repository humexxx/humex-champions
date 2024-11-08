import { useMemo } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {
  TextField,
  Autocomplete,
  Checkbox,
  Stack,
  Box,
  Skeleton,
} from '@mui/material';
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
        labels: yup.array().of(yup.string()),
      }),
    [t]
  );

  const { set, error, loading } = usePlannerSetter();

  const { register, handleSubmit, reset, setFocus } = useForm<
    yup.InferType<typeof schema>
  >({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      labels: [],
    },
  });

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    planner.items.push({ title: data.title, completed: false });
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
      <Stack spacing={2} direction="row">
        <Box sx={{ flex: 1 }}>
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
          />
        </Box>
        {uplift.loading ? (
          <Skeleton variant="circular" width={40} height={40} />
        ) : (
          <LabelsDialog uplift={uplift} />
        )}
      </Stack>
    </Stack>
  );
}

export default DailyChecklistForm;
