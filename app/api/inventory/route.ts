import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

//
// GET /api/inventory
// Fetch all inventory items
//
export async function GET() {
  try {
    const inventoryItems = await prisma.inventory.findMany({
      include: {
        material: true,
        product: true,
        movements: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(inventoryItems);
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return NextResponse.json(
      { error: "Error fetching inventory items" },
      { status: 500 }
    );
  }
}

//
// POST /api/inventory
// Create a new inventory item
//
export async function POST(request: Request) {
  try {
    const json = await request.json();

    // Basic validation
    const requiredFields = ["type", "quantity", "unit", "location"];
    for (const field of requiredFields) {
      if (json[field] === undefined || json[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // For MATERIAL type, require materialId
    if (json.type === "MATERIAL" && !json.materialId) {
      return NextResponse.json(
        { error: "For type MATERIAL, 'materialId' is required" },
        { status: 400 }
      );
    }

    // For PRODUCT type, require productId
    if (json.type === "PRODUCT" && !json.productId) {
      return NextResponse.json(
        { error: "For type PRODUCT, 'productId' is required" },
        { status: 400 }
      );
    }

    // Create the inventory item
    const newInventory = await prisma.inventory.create({
      data: {
        type: json.type,
        quantity: parseFloat(json.quantity),
        unit: json.unit,
        location: json.location,
        notes: json.notes || null,

        // Link to either material or product
        materialId: json.type === "MATERIAL" ? json.materialId : undefined,
        productId: json.type === "PRODUCT" ? json.productId : undefined,
      },
      include: {
        material: true,
        product: true,
        movements: true,
      },
    });

    return NextResponse.json(newInventory);
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return NextResponse.json(
      { error: "Error creating inventory item" },
      { status: 500 }
    );
  }
}
