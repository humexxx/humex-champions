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
import { useForm, Controller } from 'react-hook-form';
import { PageContent, PageHeader } from 'src/components';
import { GoogleLoginButton } from 'src/components/auth';
import { useAuth } from 'src/context/hooks';
import { getFullTimezone } from 'src/utils';
import * as yup from 'yup';

import { useUserSettings } from './hooks';

const schema = yup.object().shape({
  timezone: yup.string().required('This field is required'),
  useGoogleCalendar: yup.boolean(),
});

const Page = () => {
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
    <>
      <PageHeader
        title="Settings"
        description="Configure your application settings"
      ></PageHeader>

      <PageContent>
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
            <Grid item xs={6}>
              <Typography variant="h6" component="h2" gutterBottom>
                {hasGoogleProvider
                  ? 'Google Account Connected'
                  : 'Google Account Not Connected'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              {!hasGoogleProvider && <GoogleLoginButton />}
            </Grid>
          </Grid>
          <Box>
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Save
            </Button>
          </Box>
        </Stack>
      </PageContent>
    </>
  );
};

export default Page;
