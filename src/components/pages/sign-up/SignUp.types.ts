export interface SignUpFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
  persist: boolean;
}

export interface SignUpProps {
  handleOnSubmit: (form: SignUpFormInputs) => Promise<void>;
}
