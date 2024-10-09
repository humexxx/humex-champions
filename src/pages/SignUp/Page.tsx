import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
} from 'firebase/auth';
import SignUp, { SignUpFormInputs } from './components';
import { useNavigate } from 'react-router-dom';
import { handleAuthError } from 'src/utils/auth';
import { auth } from 'src/firebase';

const Page = () => {
  const navigate = useNavigate();

  async function handleOnSubmit(form: SignUpFormInputs) {
    try {
      await setPersistence(
        auth,
        form.persist ? browserLocalPersistence : browserSessionPersistence
      );
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

  return <SignUp handleOnSubmit={handleOnSubmit} />;
};

export default Page;
