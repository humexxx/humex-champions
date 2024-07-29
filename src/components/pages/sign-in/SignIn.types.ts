export interface SignInForm {
  email: string;
  password: string;
  persist: boolean;
}

export interface SignInProps {
  handleOnSubmit: (form: SignInForm) => Promise<void>;
}
