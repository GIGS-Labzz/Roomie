const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const res = await prisma.$queryRaw`SELECT version();`;
    console.log("Success! Local DB Connected via Prisma:", res);
  } catch (err) {
    console.error("Prisma local DB check failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
