import {
  ContactType,
  MeasurementUnit,
  MovementType,
  OrderStatus,
  Phase,
  PrismaClient,
  Role,
} from "@prisma/client";

const prisma = new PrismaClient();

// Sample data arrays
const users = [
  {
    email: "admin@company.com",
    name: "Admin User",
    role: Role.ADMIN,
  },
  {
    email: "production@company.com",
    name: "Production Manager",
    role: Role.PRODUCTION_MANAGER,
  },
  {
    email: "inventory@company.com",
    name: "Inventory Manager",
    role: Role.INVENTORY_MANAGER,
  },
  {
    email: "user@company.com",
    name: "Regular User",
    role: Role.USER,
  },
];

const materials = [
  {
    type: "Cotton",
    color: "Linen White",
    colorCode: "2071",
    brand: "Campolmi",
    defaultUnit: MeasurementUnit.KILOGRAM,
    defaultCostPerUnit: 25.0,
    currency: "EUR",
    notes: "30/2x4x4",
  },
  {
    type: "Cotton",
    color: "Navy Blue",
    colorCode: "2108",
    brand: "Campolmi",
    defaultUnit: MeasurementUnit.KILOGRAM,
    defaultCostPerUnit: 28.0,
    currency: "EUR",
    notes: "30/2x4x4",
  },
  {
    type: "Cotton",
    color: "Black",
    colorCode: "2094",
    brand: "Campolmi",
    defaultUnit: MeasurementUnit.KILOGRAM,
    defaultCostPerUnit: 26.0,
    currency: "EUR",
    notes: "30/2x4x4",
  },
  {
    type: "Linen",
    color: "Natural",
    colorCode: "L001",
    brand: "European Linen",
    defaultUnit: MeasurementUnit.METER,
    defaultCostPerUnit: 15.0,
    currency: "EUR",
    notes: "100% European Linen",
  },
];

const products = [
  {
    piece: "Scrunchie with Picot Trim",
    name: "Classic",
    sku: "SCRUNCH-PICOT-001",
    season: "SS24",
    phase: Phase.PRODUCTION,
    notes: "Best seller",
  },
  {
    piece: "Bucket Hat",
    name: "Classic",
    sku: "BUCKET-CLASS-001",
    season: "SS24",
    phase: Phase.PRODUCTION_SAMPLE,
    notes: "New design",
  },
  {
    piece: "Wide Brim Sun Hat",
    name: "Stripes",
    sku: "WBRIM-STRIP-001",
    season: "SS24",
    phase: Phase.FIT_SAMPLE,
    notes: "In development",
  },
];

const contacts = [
  {
    name: "John Smith",
    email: "john.smith@supplier.com",
    phone: "+1 (555) 123-4567",
    company: "Campolmi Florence",
    role: "Sales Representative",
    type: ContactType.SUPPLIER,
    notes: "Main fabric supplier contact",
  },
  {
    name: "Maria Garcia",
    email: "maria.garcia@manufacturer.com",
    phone: "+1 (555) 234-5678",
    company: "Quality Manufacturing Co.",
    role: "Production Manager",
    type: ContactType.MANUFACTURER,
    notes: "Primary manufacturing contact",
  },
];

async function seed() {
  try {
    // Clear all existing data
    await prisma.$transaction([
      prisma.materialMovement.deleteMany(),
      prisma.materialInventory.deleteMany(),
      prisma.materialOrderItem.deleteMany(),
      prisma.materialOrder.deleteMany(),
      prisma.productMaterial.deleteMany(),
      prisma.product.deleteMany(),
      prisma.material.deleteMany(),
      prisma.contact.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    console.log("Cleared existing data");

    // Create users
    const createdUsers = await Promise.all(
      users.map((user) =>
        prisma.user.create({
          data: user,
        })
      )
    );
    console.log(`Created ${createdUsers.length} users`);

    // Create materials
    const createdMaterials = await Promise.all(
      materials.map(async (material) => {
        const createdMaterial = await prisma.material.create({
          data: material,
        });

        // Create inventory entry for each material
        await prisma.materialInventory.create({
          data: {
            materialId: createdMaterial.id,
            quantity: Math.floor(Math.random() * 100),
            unit: material.defaultUnit,
            location: "Main Warehouse",
            notes: "Initial stock",
          },
        });

        // Create some random movements for each material
        const movementTypes = [
          MovementType.RECEIVED,
          MovementType.CONSUMED,
          MovementType.ADJUSTED,
        ];
        for (let i = 0; i < 3; i++) {
          await prisma.materialMovement.create({
            data: {
              materialId: createdMaterial.id,
              quantity: Math.floor(Math.random() * 50),
              unit: material.defaultUnit,
              type: movementTypes[i],
              reference: `REF-${Date.now()}-${i}`,
              notes: `Sample ${movementTypes[i]} movement`,
            },
          });
        }

        return createdMaterial;
      })
    );
    console.log(
      `Created ${createdMaterials.length} materials with inventory and movements`
    );

    // Create products
    const createdProducts = await Promise.all(
      products.map(async (product) => {
        const createdProduct = await prisma.product.create({
          data: product,
        });

        // Create product-material relationships
        await prisma.productMaterial.create({
          data: {
            productId: createdProduct.id,
            materialId:
              createdMaterials[
                Math.floor(Math.random() * createdMaterials.length)
              ].id,
            quantity: Math.random() * 5,
            unit: MeasurementUnit.METER,
            notes: "Primary material",
          },
        });

        return createdProduct;
      })
    );
    console.log(
      `Created ${createdProducts.length} products with material relationships`
    );

    // Create material orders
    const orders = [];
    for (let i = 1; i <= 3; i++) {
      const order = await prisma.materialOrder.create({
        data: {
          orderNumber: `MO-2024-00${i}`,
          supplier: "Campolmi Florence",
          totalPrice: Math.floor(Math.random() * 5000) + 1000,
          currency: "EUR",
          orderDate: new Date(2024, 0, i * 5),
          expectedDelivery: new Date(2024, 1, i * 5),
          actualDelivery: i === 1 ? new Date(2024, 1, i * 5) : null,
          status:
            i === 1
              ? OrderStatus.DELIVERED
              : i === 2
              ? OrderStatus.CONFIRMED
              : OrderStatus.PENDING,
          notes: `Order ${i} notes`,
        },
      });

      // Create 2-3 order items for each order
      const numItems = Math.floor(Math.random() * 2) + 2;
      for (let j = 0; j < numItems; j++) {
        const material =
          createdMaterials[Math.floor(Math.random() * createdMaterials.length)];
        const quantity = Math.floor(Math.random() * 50) + 10;

        await prisma.materialOrderItem.create({
          data: {
            orderId: order.id,
            materialId: material.id,
            quantity: quantity,
            unit: material.defaultUnit,
            unitPrice: material.defaultCostPerUnit,
            totalPrice: quantity * material.defaultCostPerUnit,
            notes: `Order item for ${material.color}`,
          },
        });
      }

      orders.push(order);
    }
    console.log(`Created ${orders.length} orders with items`);

    // Create contacts
    const createdContacts = await Promise.all(
      contacts.map((contact) =>
        prisma.contact.create({
          data: contact,
        })
      )
    );
    console.log(`Created ${createdContacts.length} contacts`);

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
