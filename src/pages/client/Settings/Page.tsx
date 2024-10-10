import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageContent, PageHeader } from 'src/components';
import { useUserSettings } from './hooks';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo } from 'react';
import { getFullTimezone } from 'src/utils';
import { useAuth } from 'src/context/auth';
import { GoogleLoginButton } from 'src/components/auth';

const Page = () => {
  const { t } = useTranslation();
  const { hasGoogleProvider } = useAuth();

  const schema = useMemo(
    () =>
      yup.object().shape({
        timezone: yup.string().required(t('commonValidations.required')),
      }),
    [t]
  );

  const { settings, updateTimezone } = useUserSettings();

  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      timezone: getFullTimezone(),
    },
  });

  const onSubmit = (data: { timezone: string }) => {
    updateTimezone({
      ...data,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  useEffect(() => {
    if (settings) {
      //   setValue('timezone', settings.timezone);
    }
  }, [settings, setValue]);

  return (
    <>
      <PageHeader>
        <Typography variant="h6" component="h2" gutterBottom>
          <strong>{t('settings.title')}</strong>
        </Typography>
        <Typography variant="body1">{t('settings.description')}</Typography>
      </PageHeader>

      <PageContent>
        <Stack component="form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="timezone"
            control={control}
            render={({ field }) => <TextField {...field} disabled />}
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            {t('common.save')}
          </Button>
        </Stack>
        <Divider sx={{ my: 4 }} />
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
      </PageContent>
    </>
  );
};

export default Page;
