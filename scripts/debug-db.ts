import { PrismaClient } from "@prisma/client";

async function debugDatabase() {
  const prisma = new PrismaClient();

  try {
    console.log("Attempting to connect to database...");
    await prisma.$connect();
    console.log("Successfully connected to database");

    // Check all models
    console.log("\nChecking all models...");
    const models = Object.keys(prisma).filter((key) => !key.startsWith("$"));
    console.log("Available models:", models);

    // Check contacts specifically
    console.log("\nChecking contacts...");
    const contactCount = await prisma.contact.count();
    console.log("Number of contacts:", contactCount);

    if (contactCount > 0) {
      const contacts = await prisma.contact.findMany();
      console.log("First contact:", contacts[0]);
      console.log("Total contacts found:", contacts.length);
    }

    // Check related models
    console.log("\nChecking other models...");
    const materialCount = await prisma.material.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.materialOrder.count();

    console.log("Database summary:");
    console.log("- Contacts:", contactCount);
    console.log("- Materials:", materialCount);
    console.log("- Products:", productCount);
    console.log("- Material Orders:", orderCount);
  } catch (error) {
    console.error("Error during database debug:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDatabase().catch((e) => {
  console.error("Script error:", e);
  process.exit(1);
});
