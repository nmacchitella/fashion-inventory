import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

//
// GET /api/inventory/[inventoryId]
// Fetch a single inventory item by ID
//
export async function GET(
  request: Request,
  { params }: { params: { inventoryId: string } }
) {
  try {
    const { inventoryId } = params;

    const inventoryItem = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: {
        material: true,
        product: true,
        movements: true,
      },
    });

    if (!inventoryItem) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(inventoryItem);
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    return NextResponse.json(
      { error: "Error fetching inventory item" },
      { status: 500 }
    );
  }
}

//
// PATCH /api/inventory/[inventoryId]
// Update an existing inventory item
//
export async function PATCH(
  request: Request,
  { params }: { params: { inventoryId: string } }
) {
  try {
    const { inventoryId } = params;
    const json = await request.json();

    // Ensure this inventory record exists
    const existingItem = await prisma.inventory.findUnique({
      where: { id: inventoryId },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    // Build a partial update object
    const dataToUpdate: any = {};
    if (json.quantity !== undefined) dataToUpdate.quantity = parseFloat(json.quantity);
    if (json.unit !== undefined) dataToUpdate.unit = json.unit;
    if (json.location !== undefined) dataToUpdate.location = json.location;
    if (json.notes !== undefined) dataToUpdate.notes = json.notes;

    // Could also handle "type" changes, "materialId"/"productId" changes, etc. if needed
    // Just be sure to validate that logic carefully.

    const updatedItem = await prisma.inventory.update({
      where: { id: inventoryId },
      data: dataToUpdate,
      include: {
        material: true,
        product: true,
        movements: true,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return NextResponse.json(
      { error: "Error updating inventory item" },
      { status: 500 }
    );
  }
}

//
// DELETE /api/inventory/[inventoryId]
// Delete an inventory item if it has no movements
//
export async function DELETE(
  request: Request,
  { params }: { params: { inventoryId: string } }
) {
  try {
    const { inventoryId } = params;

    const existingItem = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: {
        movements: true,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    // If this inventory has any movements, block deletion
    if (existingItem.movements.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete inventory with existing movements" },
        { status: 400 }
      );
    }

    // Delete
    await prisma.inventory.delete({
      where: { id: inventoryId },
    });

    return NextResponse.json({
      message: "Inventory item deleted successfully",
      id: inventoryId,
    });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return NextResponse.json(
      { error: "Error deleting inventory item" },
      { status: 500 }
    );
  }
}
