import { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { GoogleLoginButton } from 'src/components/auth';
import { useAuth } from 'src/context/hooks';
import { getFullTimezone } from 'src/utils';
import * as yup from 'yup';

import { PageContainer } from '../../../components/layout';
import { useUserSettings } from './hooks';

const schema = yup.object().shape({
  timezone: yup.string().required('This field is required'),
  useGoogleCalendar: yup.boolean(),
});

const SettingsPage = () => {
  const { hasGoogleProvider } = useAuth();

  const { settings, update } = useUserSettings();

  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      timezone: getFullTimezone(),
      useGoogleCalendar: false,
    },
  });

  const onSubmit = (data: { timezone: string }) => {
    update({
      ...data,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  useEffect(() => {
    if (settings) {
      setValue('timezone', settings.timezone);
      setValue('useGoogleCalendar', settings.useGoogleCalendar);
    }
  }, [settings, setValue]);

  return (
    <PageContainer title="Settings">
      <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={4}>
        <Controller
          name="timezone"
          control={control}
          render={({ field }) => <TextField {...field} disabled />}
        />
        <Controller
          name="useGoogleCalendar"
          control={control}
          render={({ field }) => (
            <FormGroup aria-label="position" row>
              <FormControlLabel
                label="Use Google Calendar"
                control={<Checkbox {...field} checked={field.value} />}
              />
            </FormGroup>
          )}
        />

        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="h6" component="h2" gutterBottom>
              {hasGoogleProvider
                ? 'Google Account Connected'
                : 'Google Account Not Connected'}
            </Typography>
          </Grid>
          <Grid size={6}>{!hasGoogleProvider && <GoogleLoginButton />}</Grid>
        </Grid>
        <Box>
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Save
          </Button>
        </Box>
      </Stack>
    </PageContainer>
  );
};

export default SettingsPage;
