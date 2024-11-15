// scripts/seed.ts
import { PrismaClient } from "@prisma/client";
import { ContactType } from "../app/types/contact";
import { MeasurementUnit, OrderStatus } from "../app/types/materialOrder";

const prisma = new PrismaClient();

const materials = [
  { color: "Linen White", colorCode: "2071" },
  { color: "Linen AAA", colorCode: "2571" },
  { color: "Navy Blue", colorCode: "2108" },
  { color: "Orange", colorCode: "2088" },
  { color: "Pink", colorCode: "2102" },
  { color: "Yellow", colorCode: "2091" },
  { color: "Almond", colorCode: "2072" },
  { color: "Black", colorCode: "2094" },
  { color: "Cerulean Blue", colorCode: "2098" },
  { color: "Dark Green", colorCode: "2095" },
  { color: "Light Green", colorCode: "2083" },
];

const products = [
  {
    piece: "Scrunchie with Picot Trim",
    name: "Classic",
    sku: "SCRUNCH-PICOT-001",
  },
  { piece: "Bracelet", name: "Classic", sku: "BRACE-CLASS-001" },
  { piece: "Bandana", name: "Classic", sku: "BAND-CLASS-001" },
  { piece: "Bucket Hat", name: "Classic", sku: "BUCKET-CLASS-001" },
  { piece: "Wide Brim Sun Hat", name: "Classic", sku: "WBRIM-CLASS-001" },
  { piece: "Wide Brim Sun Hat", name: "Stripes", sku: "WBRIM-STRIP-001" },
  { piece: "Shell Sun Hat", name: "Classic", sku: "SHELL-CLASS-001" },
  { piece: "Shell Sun Hat", name: "Stripes", sku: "SHELL-STRIP-001" },
  {
    piece: "Scallop Edge Bucket Hat",
    name: "Classic",
    sku: "SCALBUCK-CLASS-001",
  },
];

const materialOrders = [
  {
    orderNumber: "MO-2024-001",
    supplier: "Campolmi Florence",
    totalPrice: 2500.0,
    currency: "EUR",
    orderDate: new Date("2024-01-15"),
    expectedDelivery: new Date("2024-02-15"),
    status: OrderStatus.CONFIRMED,
    notes: "Spring/Summer 2024 first order",
  },
  {
    orderNumber: "MO-2024-002",
    supplier: "Campolmi Florence",
    totalPrice: 1800.0,
    currency: "EUR",
    orderDate: new Date("2024-01-20"),
    expectedDelivery: new Date("2024-02-20"),
    status: OrderStatus.PENDING,
    notes: "Additional materials for SS24",
  },
  {
    orderNumber: "MO-2024-003",
    supplier: "Campolmi Florence",
    totalPrice: 3200.0,
    currency: "EUR",
    orderDate: new Date("2024-02-01"),
    expectedDelivery: new Date("2024-03-01"),
    status: OrderStatus.PENDING,
    notes: "Pre-production materials order",
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
  {
    name: "David Lee",
    email: "david.lee@customer.com",
    phone: "+1 (555) 345-6789",
    company: "Fashion Retail Group",
    role: "Buyer",
    type: ContactType.CUSTOMER,
    notes: "Key wholesale customer",
  },
];

async function seed() {
  try {
    // Clear existing data
    await prisma.materialOrderItem.deleteMany();
    await prisma.materialOrder.deleteMany();
    await prisma.productMaterial.deleteMany();
    await prisma.product.deleteMany();
    await prisma.material.deleteMany();
    await prisma.contact.deleteMany();

    console.log("Cleared existing data");

    // Add materials
    const createdMaterials = await Promise.all(
      materials.map((material) =>
        prisma.material.create({
          data: {
            type: "Cotton",
            color: material.color,
            colorCode: material.colorCode,
            brand: "Campolmi",
            quantity: 0.0,
            unit: MeasurementUnit.KILOGRAM,
            costPerUnit: 0.0,
            currency: "EUR",
            location: "Warehouse",
            notes: "30/2x4x4",
            photos: [],
          },
        })
      )
    );

    console.log(`Added ${createdMaterials.length} materials`);

    // Add products
    const createdProducts = await Promise.all(
      products.map((product) =>
        prisma.product.create({
          data: {
            sku: product.sku,
            piece: product.piece,
            name: product.name,
            season: "SS24",
            phase: "SWATCH",
            notes: `Initial creation of ${product.piece} - ${product.name}`,
            photos: [],
          },
        })
      )
    );

    console.log(`Added ${createdProducts.length} products`);

    // Add material orders
    const createdOrders = await Promise.all(
      materialOrders.map((order) =>
        prisma.materialOrder.create({
          data: {
            orderNumber: order.orderNumber,
            supplier: order.supplier,
            totalPrice: order.totalPrice,
            currency: order.currency,
            orderDate: order.orderDate,
            expectedDelivery: order.expectedDelivery,
            status: order.status,
            notes: order.notes,
          },
        })
      )
    );

    console.log(`Added ${createdOrders.length} material orders`);

    // Add contacts
    const createdContacts = await Promise.all(
      contacts.map((contact) =>
        prisma.contact.create({
          data: {
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            company: contact.company,
            role: contact.role,
            type: contact.type,
            notes: contact.notes,
          },
        })
      )
    );

    console.log(`Added ${createdContacts.length} contacts`);

    // Add material order items
    // Create some sample order items for each order
    for (const order of createdOrders) {
      // Add 2-3 items per order with different materials
      const numItems = Math.floor(Math.random() * 2) + 2; // 2-3 items
      for (let i = 0; i < numItems; i++) {
        const material =
          createdMaterials[Math.floor(Math.random() * createdMaterials.length)];
        const quantity = Math.floor(Math.random() * 50) + 10; // 10-60 units
        const unitPrice = Math.random() * 20 + 10; // 10-30 per unit

        await prisma.materialOrderItem.create({
          data: {
            orderId: order.id,
            materialId: material.id,
            quantity: quantity,
            unit: MeasurementUnit.KILOGRAM,
            unitPrice: unitPrice,
            totalPrice: quantity * unitPrice,
            notes: `Order item for ${material.color}`,
          },
        });
      }
    }

    console.log("Added material order items");

    // Create some product-material relationships
    await prisma.productMaterial.create({
      data: {
        productId: createdProducts[0].id,
        materialId: createdMaterials[0].id,
        quantity: 1.0,
        unit: MeasurementUnit.KILOGRAM,
        notes: "Main material",
      },
    });

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
