// app/api/materials/[materialId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

//
// GET /api/materials/[materialId]
//
export async function GET(
  request: Request,
  { params }: { params: { materialId: string } }
) {
  try {
    // Now you can destructure directly without awaiting
    const { materialId } = params;

    // No request.json() for GET — remove that part entirely
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

export async function PATCH(
  request: Request,
  { params }: { params: { materialId: string } }
) {
  try {
    // 1. Await the request body
    const json = await request.json();

    // 2. Validate the payload
    if (!json) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    console.log("Received data:", json);

    // 3. Get and validate materialId
    const { materialId } = params;
    if (!materialId) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }

    // 4. Ensure the material exists first
    const existingMaterial = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    console.log(json);
    const dataToUpdate = {
      ...json,
      inventory: undefined,
      products: undefined,
    };

    // Update material using transaction to ensure data consistency
    const updatedMaterial = await prisma.$transaction(async (tx) => {
      console.log("preparing to update");
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
      console.log("done updating");
      return material;
    });

    console.log("completiiiiiiing here, repriting material");

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

export async function DELETE(
  _request: Request,
  { params }: { params: { materialId: string } }
) {
  try {
    const materialId = params.materialId;

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
      // Delete all inventory records
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

      // Finally delete the material
      await tx.material.delete({
        where: {
          id: materialId,
        },
      });
    });

    console.log("Material and related records deleted successfully");
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
