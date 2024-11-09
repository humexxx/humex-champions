import { useMemo, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LabelIcon from '@mui/icons-material/Label';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
} from '@mui/material';
import { ELabelColorType } from '@shared/enums/ELabelColorType';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { UseUplift } from '../../hooks/useUplift';
import { ILabel } from '@shared/models/uplift';
import { LoadingButton } from '@mui/lab';

const LabelsDialog = ({ uplift }: { uplift: UseUplift }) => {
  const { t } = useTranslation();
  const schema = useMemo(
    () =>
      yup.object().shape({
        title: yup
          .string()
          .nonNullable()
          .required(t('commonValidations.required')),
        color: yup.string().oneOf(Object.values(ELabelColorType)),
      }),
    [t]
  );

  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState(uplift.data?.labels ?? []);
  const [open, setOpen] = useState(false);
  const { handleSubmit, watch, setValue, register, reset, setFocus } = useForm<
    yup.InferType<typeof schema>
  >({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      color: ELabelColorType.PRIMARY,
    },
  });

  const _handleSubmit = handleSubmit((data) => {
    setLabels((prev) => [...prev, data as ILabel]);
    reset();
    setTimeout(() => setFocus('title'), 10);
  });

  const color = watch('color');

  function handleColorChange() {
    if (!color) return;
    const colors = Object.values(ELabelColorType);
    const currentIndex = colors.indexOf(color);
    const nextIndex = (currentIndex + 1) % colors.length;
    setValue('color', colors[nextIndex]);
  }

  const handleDelete = (index: number) => () => {
    setLabels((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleSaveOnClick() {
    setLoading(true);
    try {
      await uplift.set({ labels });
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <AddIcon />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm">
        <DialogTitle>Labels</DialogTitle>
        <DialogContent>
          <List sx={{ minWidth: 300 }}>
            {labels.map((label, index) => (
              <ListItem
                key={label.title + index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={handleDelete(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar sx={{ display: 'flex', alignItems: 'center' }}>
                  <LabelIcon color={label.color} />
                </ListItemAvatar>
                <ListItemText primary={label.title} />
              </ListItem>
            ))}
            <ListItem
              component="form"
              sx={{ pl: 1 }}
              onSubmit={_handleSubmit}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" type="submit">
                  <AddIcon />
                </IconButton>
              }
            >
              <ListItemAvatar sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton type="button" onClick={handleColorChange}>
                  <LabelIcon color={color} />
                </IconButton>
              </ListItemAvatar>
              <ListItemText>
                <TextField
                  label="Label"
                  fullWidth
                  size="small"
                  variant={'outlined'}
                  autoFocus
                  sx={{ pr: 1 }}
                  {...register('title')}
                />
              </ListItemText>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <LoadingButton
            color="primary"
            variant="contained"
            onClick={handleSaveOnClick}
            loading={loading}
          >
            Save
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LabelsDialog;
