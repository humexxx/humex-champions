import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  TextField,
  Checkbox,
  List as MuiList,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Alert,
  Grid,
} from '@mui/material';
import { useChecklist } from '../hooks/useChecklist';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import { LoadingButton } from '@mui/lab';

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

  const handleKeyDown = (
    event: React.KeyboardEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLDivElement
    >
  ) => {
    if (event.key === 'Enter') {
      if (!event.shiftKey) {
        event.preventDefault(); // Evita la creación de una nueva línea
        handleSubmit(onSubmit)(); // Envía el formulario
      }
      // Si Shift está presionado, no hacemos nada aquí; se permite la creación de una nueva línea
    }
  };

  return (
    <Box>
      <MuiList>
        {checklist?.items.map((item, index) => (
          <ListItem key={index} sx={{ paddingLeft: 0 }}>
            <Checkbox
              checked={item.completed}
              onChange={() => toggleItemCompletion(index)}
              size="large"
            />
            <ListItemText
              primary={`${item.name}${Boolean(item.movedFromYesterday) && ' ' + t('uplift.checklist.list.fromYesterday')}`}
            />
          </ListItem>
        ))}
      </MuiList>
      <Grid
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        container
        spacing={2}
        mt={4}
      >
        <Grid item flex={1}>
          <TextField
            label={t('uplift.checklist.list.newItem')}
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message ?? ' '}
            multiline
            fullWidth
            onKeyDown={handleKeyDown}
          />
        </Grid>
        <Grid item minHeight="100%" display="flex" alignItems="end">
          <LoadingButton
            type="submit"
            variant="contained"
            sx={{ mb: 3 }}
            startIcon={<AddIcon />}
            loading={loading}
          >
            {t('common.add')}
          </LoadingButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default List;
