import { useEffect } from 'react';

import { Container } from '@mui/material';
import {
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from 'src/consts';
import { auth } from 'src/firebase';
import { handleAuthError } from 'src/utils/auth';

import SignUp, { SignUpFormInputs } from './components';

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
        navigate(ROUTES.PORTAL.DASHBOARD);
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
