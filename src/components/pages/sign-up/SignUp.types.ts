export interface SignUpForm {
  email: string;
  password: string;
}

export interface SignUpProps {
  handleOnSubmit: (form: SignUpForm) => Promise<void>;
}
