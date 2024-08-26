import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import { AutoLogRoute } from 'src/components';
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
  return (
    <AutoLogRoute>
      <ForgotPassword handleOnSubmit={handleOnSubmit} />
    </AutoLogRoute>
  );
};

export default Page;
