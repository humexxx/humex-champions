import { Button, Grid } from '@mui/material';
import { useAuth } from 'src/context/hooks';
import { createEvent } from 'src/services/calendar';

import { useUserSettings } from '../../Settings/hooks';

const Page = () => {
  const { settings } = useUserSettings();
  const user = useAuth();

  function generateTestEvent() {
    if (!user.token) return;
    const token = localStorage.getItem('token') as string;

    createEvent(token);
  }

  return (
    <>
      {settings?.useGoogleCalendar && (
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={generateTestEvent}
          >
            Crear evento
          </Button>
        </Grid>
      )}
    </>
  );
};

export default Page;
