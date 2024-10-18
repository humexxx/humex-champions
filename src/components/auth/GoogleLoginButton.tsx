import { useState } from 'react';

import GoogleIcon from '@mui/icons-material/Google';
import { LoadingButton } from '@mui/lab';
import { Typography } from '@mui/material';
import { loginWithGoogle } from 'src/utils/auth';

const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleOnClick() {
    setLoading(true);
    try {
      const response = (await loginWithGoogle()) as any;
      localStorage.setItem('token', response._tokenResponse.oauthAccessToken);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <LoadingButton
        startIcon={<GoogleIcon />}
        fullWidth
        variant="outlined"
        type="button"
        sx={{ mb: 2 }}
        loading={loading}
        onClick={handleGoogleOnClick}
      >
        Sign Up with Google
      </LoadingButton>
      <Typography variant="caption" color="error" sx={{ mt: 2 }}>
        {error}
      </Typography>
    </>
  );
};

export default GoogleLoginButton;
