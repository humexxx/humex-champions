import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import ForgotPassword, { ForgotPasswordFormInputs } from './components';

async function handleOnSubmit(form: ForgotPasswordFormInputs) {
  await sendPasswordResetEmail(auth, form.email)
    .then(() => {
      console.log('Password reset email sent');
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
}

const Page = () => {
  return <ForgotPassword handleOnSubmit={handleOnSubmit} />;
};

export default Page;
