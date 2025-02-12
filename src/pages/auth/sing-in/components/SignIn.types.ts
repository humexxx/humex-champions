export interface SignInFormInputs {
  email: string;
  password: string;
  persist: boolean;
}

export interface SignInProps {
  handleOnSubmit: (form: SignInFormInputs) => Promise<void>;
}
