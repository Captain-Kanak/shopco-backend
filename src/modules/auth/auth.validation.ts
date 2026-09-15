import * as z from "zod";

const nameSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined ? "Name is required" : "Name must be a string",
  })
  .trim()
  .min(1, "Name is required")
  .max(100, "Name can't be more than 100 characters long");

const emailSchema = z
  .email("Invalid email address")
  .min(1, "Email is required")
  .max(255, "Email can't be more than 255 characters long");

const passwordSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Password is required"
        : "Password must be a string",
  })
  .min(8, "Password must be at least 8 characters long")
  .max(50, "Password can't be more than 50 characters long");

const otpSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined ? "OTP is required" : "OTP must be a string",
  })
  .length(6, "OTP must be exactly 6 characters long");

const registerUser = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

const verifyEmail = z.object({
  email: emailSchema,
  otp: otpSchema,
});

const loginUser = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const authValidation = {
  registerUser,
  verifyEmail,
  loginUser,
};
