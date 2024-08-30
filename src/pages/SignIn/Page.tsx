import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import SignIn, { SignInFormInputs } from './components';
import { useNavigate } from 'react-router-dom';
import { handleAuthError } from 'src/utils/auth';
import { auth } from 'src/firebase';

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

  return <SignIn handleOnSubmit={handleOnSubmit} />;
};

export default Page;
