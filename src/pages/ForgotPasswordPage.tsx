import { createUserWithEmailAndPassword } from 'firebase/auth';
import SignIn, { SignInForm } from '../components/pages/sign-in';
import { auth } from '../firebase';
import { AutoLogRoute } from 'src/components/common';

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

const ForgotPasswordPage = () => {
  return (
    <AutoLogRoute>
      <SignIn handleOnSubmit={handleOnSubmit} />
    </AutoLogRoute>
  );
};

export default ForgotPasswordPage;
