// src/components/Checklist.tsx
import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  TextField,
  Button,
  Checkbox,
  List as MuiList,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';
import { useChecklist } from '../hooks/useChecklist';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

interface ChecklistFormInputs {
  name: string;
}

const List = () => {
  const { t } = useTranslation();
  const checklistItemSchema = useMemo(
    () =>
      yup.object().shape({
        name: yup.string().required(t('commonValidations.required')),
      }),
    [t]
  );

  const { checklist, loading, error, addItem, toggleItemCompletion } =
    useChecklist();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChecklistFormInputs>({
    resolver: yupResolver(checklistItemSchema),
  });

  const onSubmit = async (data: ChecklistFormInputs) => {
    await addItem(data.name);
    reset();
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="New Item"
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Add Item
        </Button>
      </form>

      <MuiList>
        {checklist?.items.map((item, index) => (
          <ListItem key={index} disablePadding>
            <Checkbox
              checked={item.completed}
              onChange={() => toggleItemCompletion(index)}
            />
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </MuiList>
    </Box>
  );
};

export default List;
