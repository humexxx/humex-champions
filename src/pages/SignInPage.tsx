import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { auth } from '../firebase';
import { AutoLogRoute } from 'src/components/common';
import SignIn, { SignInFormInputs } from 'src/components/pages/sign-in';
import { useNavigate } from 'react-router-dom';
import { handleAuthError } from 'src/utils/auth';

const SignInPage = () => {
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
    <AutoLogRoute>
      <SignIn handleOnSubmit={handleOnSubmit} />
    </AutoLogRoute>
  );
};

export default SignInPage;
