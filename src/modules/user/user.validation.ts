import * as z from "zod";

const nameSchema = z
  .string({ error: "Name must be a string" })
  .trim()
  .min(1, "Name can't be empty")
  .max(100, "Name can't be more than 100 characters long");

const phoneSchema = z
  .string({ error: "Phone must be a string" })
  .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number");

const addressSchema = z
  .string({ error: "Address must be a string" })
  .trim()
  .min(1, "Address can't be empty")
  .max(500, "Address can't be more than 500 characters long");

const dateOfBirthSchema = z.iso
  .date()
  .refine((val) => new Date(val) < new Date(), {
    message: "Date of birth cannot be in the future",
  });

const updateProfile = z
  .object({
    name: nameSchema,
    phone: phoneSchema,
    address: addressSchema,
    dateOfBirth: dateOfBirthSchema,
  })
  .partial()
  .strict();

export const userValidation = {
  updateProfile,
};
