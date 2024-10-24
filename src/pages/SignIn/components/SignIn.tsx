import { useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { LoadingButton } from '@mui/lab';
import { Divider } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { GoogleLoginButton } from 'src/components/auth';
import * as yup from 'yup';

import { SignInProps, SignInFormInputs } from './SignIn.types';


const schema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup.string().required('Password is required'),
  persist: yup.boolean().default(false),
});

export default function SignIn({ handleOnSubmit }: SignInProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignInFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      persist: false,
    },
  });

  const onSubmit: SubmitHandler<SignInFormInputs> = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      await handleOnSubmit(data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Sign In
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ mt: 2 }}
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="dense"
              required
              fullWidth
              label="Email Address"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email ? errors.email.message : ' '}
              size="medium"
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="dense"
              required
              fullWidth
              label="Password"
              type="password"
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password ? errors.password.message : ' '}
              size="medium"
            />
          )}
        />
        <Controller
          name="persist"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox {...field} color="primary" />}
              label="Remember me"
            />
          )}
        />
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          loading={isLoading}
        >
          Sign In
        </LoadingButton>
        <Divider sx={{ my: 4 }}>or</Divider>
        <GoogleLoginButton />
        <Grid container>
          <Grid item xs>
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              Forgot password?
            </Link>
          </Grid>
          <Grid item>
            <Link component={RouterLink} to="/sign-up" variant="body2">
              {"Don't have an account? Sign Up"}
            </Link>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
