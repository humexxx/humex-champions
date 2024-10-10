import { LoadingButton } from '@mui/lab';
import GoogleIcon from '@mui/icons-material/Google';
import { useState } from 'react';
import { loginWithGoogle } from 'src/utils/auth';
import { Typography } from '@mui/material';

const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleOnClick() {
    setLoading(true);
    try {
      await loginWithGoogle();
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
