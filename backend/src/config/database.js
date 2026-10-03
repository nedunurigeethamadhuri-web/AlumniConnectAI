const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL database connected successfully!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log("🔌 PostgreSQL database disconnected.");
}

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
};