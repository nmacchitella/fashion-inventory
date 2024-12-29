import { PrismaClient } from "@prisma/client";
import fs from "fs";

interface MaterialInput {
  code: string;
  quantity: number;
  thread?: string;
}

const prisma = new PrismaClient();

export async function seedProducts() {
  try {
    // Delete all existing products and their relations
    await prisma.productMaterial.deleteMany({});
    await prisma.inventory.deleteMany({
      where: { type: "PRODUCT" },
    });
    await prisma.product.deleteMany({});

    const rawData = fs.readFileSync(
      "/Users/nmacchitella/Documents/fashion-inventory/scripts/seed-data/products.json",
      "utf8"
    );
    const products = JSON.parse(rawData);

    for (const product of products) {
      // Create the product first
      const createdProduct = await prisma.product.create({
        data: {
          name: product.name,
          sku: product.SKU,
          piece: "accessory", // You might want to make this dynamic
          season: product.season,
          phase: product.phase,
          photos: [],
          // Create the product-material relationships
          materials: {
            create: await Promise.all(
              product.materials.map(async (material: MaterialInput) => {
                // Find the material by colorCode
                const materialRecord = await prisma.material.findFirst({
                  where: {
                    AND: [
                      { colorCode: material.code },
                      {
                        properties: {
                          path: ["thread"],
                          equals: material.thread,
                        },
                      },
                    ],
                  },
                });

                if (!materialRecord) {
                  throw new Error(
                    `Material with colorCode ${material.code} not found`
                  );
                }

                return {
                  materialId: materialRecord.id,
                  quantity: material.quantity,
                  unit: "GRAM", // You might want to make this dynamic
                  notes: material.thread ? `Thread: ${material.thread}` : null,
                };
              })
            ),
          },
          // Create initial inventory
          inventory: {
            create: {
              type: "PRODUCT",
              quantity: 0.0,
              unit: "UNIT",
              location: "WAREHOUSE",
            },
          },
        },
      });
      console.log(`Created product: ${createdProduct.name}`);
    }

    console.log("Product seeding completed");
  } catch (error) {
    console.error("Error seeding products:", error);
    throw error;
  }
}

// If running directly
if (require.main === module) {
  seedProducts()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
