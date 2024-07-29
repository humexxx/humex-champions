export interface ForgotPasswordForm {
  email: string;
}

export interface ForgotPasswordProps {
  handleOnSubmit: (form: ForgotPasswordForm) => Promise<void>;
}
