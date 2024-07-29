import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  AuthErrorCodes,
} from 'firebase/auth';
import { auth } from '../firebase';
import SignUp, { SignUpForm } from 'src/components/pages/sign-up';
import { useNavigate } from 'react-router-dom';
import { AutoLogRoute } from 'src/components/common';
import { FirebaseError } from 'firebase/app';

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
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case AuthErrorCodes.EMAIL_EXISTS:
            alert('Email already exists');
            break;
          case AuthErrorCodes.INVALID_EMAIL:
            alert('Invalid email');
            break;
          case AuthErrorCodes.WEAK_PASSWORD:
            alert('Weak password');
            break;
          default:
            alert('An error occurred');
        }
      }
    }
  }

  return (
    <AutoLogRoute>
      <SignUp handleOnSubmit={handleOnSubmit} />
    </AutoLogRoute>
  );
};

export default SignUpPage;
