import { betterAuth } from "better-auth";
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
  session: {
    expiresIn: Math.floor(
      ms(env.BETTER_AUTH_SESSION_EXPIRES_IN as StringValue) / 1000,
    ),
    updateAge: Math.floor(
      ms(env.BETTER_AUTH_SESSION_UPDATE_AGE as StringValue) / 1000,
    ),
    cookieCache: {
      enabled: true,
      maxAge: Math.floor(
        ms(env.BETTER_AUTH_SESSION_EXPIRES_IN as StringValue) / 1000,
      ),
    },
  },
  advanced: {
    disableCSRFCheck: env.NODE_ENV === "development",
    cookiePrefix: "better-auth",
    useSecureCookies: env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: env.NODE_ENV === "production",
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
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    onExistingUserSignUp: async ({ user }) => {
      // e.g. send "someone tried to sign up with your email" notice
      console.log(`Duplicate signup attempt for ${user.email}`);
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
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "Verify your email address",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              },
              attachments: [
                {
                  filename: "logo.png",
                  content: "logo",
                  contentType: "image/png",
                },
              ],
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            sendEmail({
              to: email,
              subject: "Reset your password",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              },
              attachments: [
                {
                  filename: "logo.png",
                  content: "logo",
                  contentType: "image/png",
                },
              ],
            });
          }
        }
      },
      expiresIn: 60 * 5,
      otpLength: 6,
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: UserRole.CUSTOMER,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
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
      },
    },
  },
});
