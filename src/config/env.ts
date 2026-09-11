import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

interface ENV {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  FRONTEND_URL: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_SESSION_EXPIRES_IN: string;
  BETTER_AUTH_SESSION_UPDATE_AGE: string;
}

function loadEnv(): ENV {
  const requiredEnvVariables = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "FRONTEND_URL",
    "BETTER_AUTH_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_SESSION_EXPIRES_IN",
    "BETTER_AUTH_SESSION_UPDATE_AGE",
  ];

  requiredEnvVariables.forEach((envVariable) => {
    if (!process.env[envVariable]) {
      throw new Error(
        `Missing environment variable: ${envVariable} in .env file`,
      );
    }
  });

  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_SESSION_EXPIRES_IN: process.env
      .BETTER_AUTH_SESSION_EXPIRES_IN as string,
    BETTER_AUTH_SESSION_UPDATE_AGE: process.env
      .BETTER_AUTH_SESSION_UPDATE_AGE as string,
  };
}

export const env = loadEnv();
