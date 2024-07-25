import { createUserWithEmailAndPassword } from 'firebase/auth';
import SignIn, { SignInForm } from '../components/signin';
import { auth } from '../firebase';

async function handleOnSubmit(form: SignInForm) {
  await createUserWithEmailAndPassword(auth, form.email, form.password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
}

const SignInPage = () => {
  return <SignIn handleOnSubmit={handleOnSubmit} />;
};

export default SignInPage;
