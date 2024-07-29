export interface SignUpForm {
  email: string;
  password: string;
  confirmPassword: string;
  persist: boolean;
}

export interface SignUpProps {
  handleOnSubmit: (form: SignUpForm) => Promise<void>;
}
