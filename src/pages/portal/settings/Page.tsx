import { useEffect, useMemo } from 'react';

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
import { useTranslation } from 'react-i18next';
import { PageContent, PageHeader } from 'src/components';
import { GoogleLoginButton } from 'src/components/auth';
import { useAuth } from 'src/context/hooks';
import { getFullTimezone } from 'src/utils';
import * as yup from 'yup';

import { useUserSettings } from './hooks';

const Page = () => {
  const { t } = useTranslation();
  const { hasGoogleProvider } = useAuth();

  const schema = useMemo(
    () =>
      yup.object().shape({
        timezone: yup.string().required(t('commonValidations.required')),
        useGoogleCalendar: yup.boolean(),
      }),
    [t]
  );

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
        title={t('settings.title')}
        description={t('settings.description')}
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
                  ? t('settings.googleLoggedIn')
                  : t('settings.googleNotLoggedIn')}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              {!hasGoogleProvider && <GoogleLoginButton />}
            </Grid>
          </Grid>
          <Box>
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              {t('common.save')}
            </Button>
          </Box>
        </Stack>
      </PageContent>
    </>
  );
};

export default Page;
