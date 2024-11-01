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

  const { register, handleSubmit, reset, setFocus } = useForm<
    yup.InferType<typeof schema>
  >({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
    },
  });

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    planner.items.push({ title: data.title, completed: false });
    await set(planner);
    reset();
    setTimeout(() => setFocus('title'), 0);
  };

  return (
    <Box component={'form'} onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label={t('uplift.planner.form.newTask')}
        {...register('title')}
        error={!!error}
        helperText={error}
        fullWidth
        disabled={loading}
        size="small"
        variant={'filled'}
      />
    </Box>
  );
}

export default Form;
