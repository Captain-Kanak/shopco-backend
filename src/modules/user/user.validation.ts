import * as z from "zod";

const nameSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined ? "Name is required" : "Name must be a string",
  })
  .trim()
  .min(1, "Name is required")
  .max(100, "Name can't be more than 100 characters long");

const phoneSchema = z
  .string({ error: "Phone must be a string" })
  .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number");

const addressSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Address is required"
        : "Address must be a string",
  })
  .trim()
  .min(1, "Address can't be empty")
  .max(500, "Address can't be more than 500 characters long");

const dateOfBirthSchema = z.iso
  .date()
  .refine((val) => new Date(val) < new Date(), {
    message: "Date of birth cannot be in the future",
  });

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

const updateProfile = z
  .object({
    name: nameSchema,
    phone: phoneSchema,
    address: addressSchema,
    dateOfBirth: dateOfBirthSchema,
  })
  .partial()
  .strict();

const forgetPassword = z
  .object({
    email: emailSchema,
  })
  .strict();

const resetPassword = z
  .object({
    email: emailSchema,
    otp: otpSchema,
    password: passwordSchema,
  })
  .strict();

export const userValidation = {
  updateProfile,
  forgetPassword,
  resetPassword,
};
