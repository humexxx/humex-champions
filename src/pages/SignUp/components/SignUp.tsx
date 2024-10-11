import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { LoadingButton } from '@mui/lab';
import { Link as RouterLink } from 'react-router-dom';
import { SignUpFormInputs } from './SignUp.types';
import { Checkbox, Divider, FormControlLabel } from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { GoogleLoginButton } from 'src/components/auth';

// Define the validation schema
const schema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup.string().required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
  persist: yup.boolean().default(false),
});

interface Props {
  handleOnSubmit: (form: SignUpFormInputs) => Promise<void>;
}

export default function SignUp({ handleOnSubmit }: Props) {
  const [loading, setLoading] = useState({ google: false, form: false });
  const [error, setError] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      persist: false,
    },
  });

  const onSubmit: SubmitHandler<SignUpFormInputs> = async (data) => {
    setLoading({ ...loading, form: true });
    setError(null);

    try {
      await handleOnSubmit(data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading({ ...loading, form: false });
    }
  };

  return (
    <>
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Sign Up
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
              fullWidth
              label="Password"
              type="password"
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password ? errors.password.message : ' '}
              size="medium"
            />
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="dense"
              fullWidth
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              helperText={
                errors.confirmPassword ? errors.confirmPassword.message : ' '
              }
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
          sx={{ mt: 3 }}
          loading={loading.form}
        >
          Sign Up
        </LoadingButton>
        <Divider sx={{ my: 4 }}>or</Divider>
        <GoogleLoginButton />
        <Grid container>
          <Grid item xs>
            <Link component={RouterLink} to="/sign-in" variant="body2">
              {'Already have an account? Sign In'}
            </Link>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
