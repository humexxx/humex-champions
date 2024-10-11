import { Container } from '@mui/material';
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from 'src/firebase';
import { handleAuthError } from 'src/utils/auth';

import SignIn, { SignInFormInputs } from './components';

const Page = () => {
  const navigate = useNavigate();

  async function handleOnSubmit(form: SignInFormInputs) {
    try {
      await setPersistence(
        auth,
        form.persist ? browserLocalPersistence : browserSessionPersistence
      );
      await signInWithEmailAndPassword(auth, form.email, form.password).then(
        () => {
          navigate('/client/dashboard');
        }
      );
    } catch (error) {
      handleAuthError(error);
    }
  }

  return (
    <Container
      maxWidth="xs"
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <SignIn handleOnSubmit={handleOnSubmit} />
    </Container>
  );
};

export default Page;
