import app from "./app.js";
import { env } from "./config/env.js";

const port = Number(env.PORT) || 5000;

async function startServer() {
  try {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

startServer();
