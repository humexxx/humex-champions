import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
} from 'firebase/auth';
import { auth } from '../firebase';
import SignUp, { SignUpForm } from 'src/components/pages/sign-up';
import { useNavigate } from 'react-router-dom';
import { AutoLogRoute } from 'src/components/common';

const SignUpPage = () => {
  const navigate = useNavigate();

  async function handleOnSubmit(form: SignUpForm) {
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
      console.error(error);
    }
  }

  return (
    <AutoLogRoute>
      <SignUp handleOnSubmit={handleOnSubmit} />
    </AutoLogRoute>
  );
};

export default SignUpPage;
