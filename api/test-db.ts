import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const vehicles = await prisma.vehicle.findMany();
    console.log("Success", vehicles.length);
  } catch (e) {
    console.error("Failed:", e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();
