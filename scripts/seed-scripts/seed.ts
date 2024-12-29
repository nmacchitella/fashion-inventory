import { PrismaClient } from "@prisma/client";
import { seedMaterials } from "./materials";
import { seedProducts } from "./products";
const prisma = new PrismaClient();

async function main() {
  try {
    await seedMaterials();
    await seedProducts();
    console.log("All seed operations completed");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
