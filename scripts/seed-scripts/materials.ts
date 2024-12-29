import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

export async function seedMaterials() {
  try {
    // Delete all existing materials and their relations
    await prisma.productMaterial.deleteMany({});
    await prisma.inventory.deleteMany({
      where: { type: "MATERIAL" },
    });
    await prisma.material.deleteMany({});

    // Read the seed data file
    const rawData = fs.readFileSync(
      "/Users/nmacchitella/Documents/fashion-inventory/scripts/seed-data/materials.json",
      "utf8"
    );
    const materials = JSON.parse(rawData);

    console.log(`Starting to seed ${materials.length} materials...`);

    // Create materials
    for (const material of materials) {
      const created = await prisma.material.create({
        data: {
          type: material.type,
          color: material.color,
          colorCode: material.colorCode.toString(), // Convert to string as per schema
          brand: material.brand,
          defaultUnit: material.defaultUnit,
          defaultCostPerUnit:
            Number(material.defaultCostPerUnit) ||
            parseFloat(material.defaultCostPerUnit),
          currency: material.currency,
          properties: material.properties,
          // Create initial inventory for each material
          inventory: {
            create: {
              type: "MATERIAL",
              quantity: 0.0, // Initial quantity
              unit: material.defaultUnit,
              location: "WAREHOUSE", // Default location
            },
          },
        },
      });
      console.log(`Created material: ${created.color} ${created.type}`);
    }

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
