export interface UpdateUser {
  name?: string;
  image?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
}

export interface ForgetPassword {
  email: string;
}

export interface ResetPassword {
  email: string;
  otp: string;
  password: string;
}
