import { useMemo, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LabelIcon from '@mui/icons-material/Label';
import {
  Avatar,
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
} from '@mui/material';
import { ELabelColorType } from '@shared/enums/ELabelColorType';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { UseUplift } from '../../hooks/useUplift';

const LabelsDialog = ({ uplift }: { uplift: UseUplift }) => {
  const { t } = useTranslation();
  const schema = useMemo(
    () =>
      yup.object().shape({
        labels: yup.array().of(
          yup.object().shape({
            title: yup
              .string()
              .nonNullable()
              .required(t('commonValidations.required')),
            color: yup.string().oneOf(Object.values(ELabelColorType)),
          })
        ),
      }),
    [t]
  );

  const [open, setOpen] = useState(false);
  const { control } = useForm<yup.InferType<typeof schema>>({
    resolver: yupResolver(schema),
    defaultValues: {
      labels: uplift.data?.labels ?? [],
    },
  });

  const fieldArray = useFieldArray({
    control,
    name: 'labels',
  });

  console.log(fieldArray.fields);

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <AddIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        component={'form'}
      >
        <DialogTitle>Labels</DialogTitle>
        <DialogContent>
          <List sx={{ minWidth: 300 }}>
            {fieldArray.fields.map((field) => (
              <ListItem
                key={field.id}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ backgroundColor: 'ButtonShadow' }}>
                    <LabelIcon color={field.color} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={field.title} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LabelsDialog;
