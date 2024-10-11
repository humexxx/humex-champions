import { sendPasswordResetEmail } from 'firebase/auth';

import ForgotPassword, { ForgotPasswordFormInputs } from './components';
import { auth } from '../../firebase';

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
