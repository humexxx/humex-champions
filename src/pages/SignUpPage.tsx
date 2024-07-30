import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  AuthErrorCodes,
} from 'firebase/auth';
import { auth } from '../firebase';
import SignUp, { SignUpFormInputs } from 'src/components/pages/sign-up';
import { useNavigate } from 'react-router-dom';
import { AutoLogRoute } from 'src/components/common';
import { FirebaseError } from 'firebase/app';

const SignUpPage = () => {
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
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case AuthErrorCodes.EMAIL_EXISTS:
            throw new Error('Email already exists');
          case AuthErrorCodes.INVALID_EMAIL:
            throw new Error('Invalid email');
          case AuthErrorCodes.WEAK_PASSWORD:
            throw new Error('Weak password');
          default:
            throw new Error('An error occurred');
        }
      }
      throw error;
    }
  }

  return (
    <AutoLogRoute>
      <SignUp handleOnSubmit={handleOnSubmit} />
    </AutoLogRoute>
  );
};

export default SignUpPage;
