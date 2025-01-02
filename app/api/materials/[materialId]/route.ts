// app/api/materials/[materialId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/materials/[materialId]
 * Fetch a single material by ID
 */
export async function GET(request: NextRequest, context) {
  try {
    const { materialId } = context.params;

    console.log("GET request for material:", materialId);

    const material = await prisma.material.findUnique({
      where: {
        id: materialId,
      },
      include: {
        inventory: {
          include: {
            movements: true,
          },
        },
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error("Error fetching material:", error);
    return NextResponse.json(
      { error: "Error fetching material" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/materials/[materialId]
 * Update an existing material
 */
export async function PATCH(request: NextRequest, context) {
  try {
    const { materialId } = context.params;
    const json = await request.json();

    // Validate the payload
    if (!json) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    console.log("Received data:", json);

    // Ensure the material exists first
    const existingMaterial = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Build a partial update object
    const dataToUpdate: Partial<typeof json> = {
      ...json,
      inventory: undefined, // Exclude relations if necessary
      products: undefined, // Exclude relations if necessary
    };

    // Optional: Validate and sanitize dataToUpdate here

    // Update material using transaction to ensure data consistency
    const updatedMaterial = await prisma.$transaction(async (tx) => {
      console.log("Preparing to update material");
      console.log("Actual data sent to Prisma:", dataToUpdate);
      const material = await tx.material.update({
        where: { id: materialId },
        data: dataToUpdate,
        include: {
          inventory: {
            include: {
              movements: true,
            },
          },
          products: {
            include: {
              product: true,
            },
          },
        },
      });
      console.log("Material updated successfully");
      return material;
    });

    console.log("Update transaction completed for material:", materialId);

    return NextResponse.json(updatedMaterial);
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      {
        error: "Error updating material",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/materials/[materialId]
 * Delete a material if it has no related inventory or products
 */
export async function DELETE(request: NextRequest, context) {
  try {
    const { materialId } = context.params;

    console.log("Attempting to delete material:", materialId);

    // Check if material exists with all relevant relations
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        inventory: {
          include: {
            movements: true,
          },
        },
        products: true,
      },
    });

    if (!material) {
      console.log("Material not found:", materialId);
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Check if material has any inventory or product relationships
    if (material.inventory.length > 0 || material.products.length > 0) {
      // Check if any inventory has movements
      const hasMovements = material.inventory.some(
        (inv) => inv.movements.length > 0
      );

      if (hasMovements) {
        return NextResponse.json(
          { error: "Cannot delete material with existing inventory movements" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error:
            "Cannot delete material that is in use by products or has existing inventory",
        },
        { status: 400 }
      );
    }

    // Use transaction to ensure all related records are deleted properly
    await prisma.$transaction(async (tx) => {
      // Delete all inventory records related to the material
      await tx.inventory.deleteMany({
        where: {
          materialId: materialId,
        },
      });

      // Delete all product-material relationships
      await tx.productMaterial.deleteMany({
        where: {
          materialId: materialId,
        },
      });

      // Finally, delete the material itself
      await tx.material.delete({
        where: {
          id: materialId,
        },
      });
    });

    console.log(
      "Material and related records deleted successfully:",
      materialId
    );
    return NextResponse.json({
      message: "Material deleted successfully",
      id: materialId,
    });
  } catch (error) {
    console.error("Error during material deletion:", error);
    return NextResponse.json(
      {
        error: "Error deleting material",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
