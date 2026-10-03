require("dotenv").config();

const app = require("./app");
const {
  connectDatabase,
  disconnectDatabase,
} = require("./config/database");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log(
        `🚀 AlumniConnect AI backend running on http://localhost:${PORT}`
      );
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down server...`);

      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();