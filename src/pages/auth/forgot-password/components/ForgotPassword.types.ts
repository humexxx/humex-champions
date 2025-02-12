export interface ForgotPasswordFormInputs {
  email: string;
}

export interface ForgotPasswordProps {
  handleOnSubmit: (form: ForgotPasswordFormInputs) => Promise<void>;
}
