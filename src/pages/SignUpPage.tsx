import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import SignUp, { SignUpForm } from 'src/components/sign-up';
import { useNavigate } from 'react-router-dom';
import { AutoLogRoute } from 'src/components';

const SignUpPage = () => {
  const navigate = useNavigate();

  async function handleOnSubmit(form: SignUpForm) {
    await createUserWithEmailAndPassword(auth, form.email, form.password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.info(user);
        navigate('/client/dashboard');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
      });
  }

  return (
    <AutoLogRoute>
      <SignUp handleOnSubmit={handleOnSubmit} />
    </AutoLogRoute>
  );
};

export default SignUpPage;
