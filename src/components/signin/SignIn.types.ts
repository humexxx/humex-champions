export interface SignInForm {
  email: string;
  password: string;
}

export interface SignInProps {
  handleOnSubmit: (form: SignInForm) => Promise<void>;
}
