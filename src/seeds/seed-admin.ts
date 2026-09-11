import status from "http-status";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import AppError from "../errors/app-error.js";
import { auth } from "../lib/auth.js";

const adminData = {
  name: "Admin",
  email: "admin@gmail.com",
  password: "12345678",
};

const seedAdmin = async () => {
  try {
    const admin = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });

    if (admin) {
      throw new AppError(
        "Admin already exist with this email",
        status.BAD_REQUEST,
      );
    }

    const result = await auth.api.signUpEmail({
      body: adminData,
    });

    if (result.user) {
      await prisma.user.update({
        where: {
          id: result.user.id,
        },
        data: {
          emailVerified: true,
          role: UserRole.ADMIN,
        },
      });

      console.log("Admin seeded successfully");
    } else {
      throw new AppError("Failed to seed admin", status.INTERNAL_SERVER_ERROR);
    }
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError("Failed to seed admin", status.INTERNAL_SERVER_ERROR);
  }
};

seedAdmin();
