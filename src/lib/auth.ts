import { betterAuth } from "better-auth";
import { v7 as uuidv7 } from "uuid";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { UserRole, UserStatus } from "@prisma/client";
import { env } from "../config/env.js";
import ms, { StringValue } from "ms";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/send-email.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.FRONTEND_URL, env.BETTER_AUTH_URL],
  advanced: {
    database: {
      generateId: (options) => {
        return uuidv7();
      },
    },
    disableCSRFCheck: env.NODE_ENV === "development",
    cookiePrefix: "better-auth",
    useSecureCookies: env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
    cookies: {
      state: {
        attributes: {
          secure: true,
          httpOnly: true,
          sameSite: "none",
          path: "/",
        },
      },
      sessionToken: {
        attributes: {
          secure: true,
          httpOnly: true,
          sameSite: "none",
          path: "/",
        },
      },
    },
  },
  session: {
    expiresIn: Math.floor(
      ms(env.BETTER_AUTH_SESSION_EXPIRES_IN as StringValue) / 1000,
    ),
    updateAge: Math.floor(
      ms(env.BETTER_AUTH_SESSION_UPDATE_AGE as StringValue) / 1000,
    ),
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    onExistingUserSignUp: async ({ user }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Signup attempt on your ShopCo account",
          templateName: "duplicateSignupNotice",
          templateData: { name: user.name },
        });
      } catch (error) {
        console.error("Failed to send duplicate-signup notice email:", error);
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({ where: { email } });

          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "Verify your email address",
              templateName: "otp",
              templateData: { name: user.name, otp },
            }).catch((error) => {
              console.error("Failed to send verification OTP email:", error);
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({ where: { email } });

          if (user) {
            sendEmail({
              to: email,
              subject: "Reset your password",
              templateName: "otp",
              templateData: { name: user.name, otp },
            }).catch((error) => {
              console.error("Failed to send password reset OTP email:", error);
            });
          }
        }
      },
      expiresIn: 60 * 5,
      otpLength: 6,
    }),
  ],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: UserRole.CUSTOMER,
        input: false,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      address: {
        type: "string",
        required: false,
      },
      dateOfBirth: {
        type: "date",
        required: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
});
