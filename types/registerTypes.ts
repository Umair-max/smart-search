export interface SignupTypes {
  email: string;
  password: string;
}
export interface SigninTypes {
  email: string;
  password: string;
}

export interface VerificationTypes {
  code: string;
}

export interface ForgotTypes {
  email: string;
}

export interface ResetTypes {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
