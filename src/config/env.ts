import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

interface ENV {
  NODE_ENV: string;
  PORT: string;
}

function loadEnv(): ENV {
  const requiredEnvVariables = ["NODE_ENV", "PORT"];

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
  };
}

export const env = loadEnv();
