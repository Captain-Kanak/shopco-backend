export interface RegisterUser {
  name: string;
  email: string;
  password: string;
}

export interface VerifyEmail {
  email: string;
  otp: string;
}

export interface LoginUser {
  email: string;
  password: string;
}
