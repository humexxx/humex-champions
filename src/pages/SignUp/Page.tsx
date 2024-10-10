import {
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
} from 'firebase/auth';
import SignUp, { SignUpFormInputs } from './components';
import { useNavigate } from 'react-router-dom';
import { handleAuthError } from 'src/utils/auth';
import { auth } from 'src/firebase';
import { Container } from '@mui/material';
import { useEffect } from 'react';

const Page = () => {
  const navigate = useNavigate();

  async function handleOnSubmit(form: SignUpFormInputs) {
    try {
      // await setPersistence(
      //   auth,
      //   form.persist ? browserLocalPersistence : browserSessionPersistence
      // );
      await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      ).then(() => {
        navigate('/client/dashboard');
      });
    } catch (error) {
      handleAuthError(error);
    }
  }

  useEffect(() => {
    (async () => {
      const auth = getAuth();
      try {
        const result = await getRedirectResult(auth);
        console.log(result);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

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
      <SignUp handleOnSubmit={handleOnSubmit} />
    </Container>
  );
};

export default Page;
