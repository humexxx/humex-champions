import { useMemo } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { TextField, Box } from '@mui/material';
import { IPlanner } from '@shared/models/uplift';
import { Dayjs } from 'dayjs';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { usePlannerSetter } from '../hooks';

function Form({ planner }: { planner: IPlanner<Dayjs> }) {
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      yup.object().shape({
        title: yup
          .string()
          .nonNullable()
          .required(t('commonValidations.required')),
      }),
    [t]
  );

  const { set, error, loading } = usePlannerSetter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<yup.InferType<typeof schema>>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
    },
  });

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    planner.items.push({ title: data.title, completed: false });
    await set(planner);
    reset();
  };

  return (
    <Box component={'form'} onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label={t('uplift.planner.form.newTask')}
        {...register('title')}
        error={!!errors.title || !!error}
        helperText={errors.title?.message || error}
        fullWidth
        disabled={loading}
        size="small"
        variant={'filled'}
      />
    </Box>
  );
}

export default Form;
