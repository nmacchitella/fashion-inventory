import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { materialId: string } }
) {
  try {
    const material = await prisma.material.findUnique({
      where: {
        id: params.materialId,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        materialOrderItems: {
          include: {
            order: true,
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
    console.error("Error:", error);
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
    const json = await request.json();

    const material = await prisma.material.update({
      where: {
        id: params.materialId,
      },
      data: {
        type: json.type,
        color: json.color,
        colorCode: json.colorCode,
        brand: json.brand,
        quantity: parseFloat(json.quantity),
        unit: json.unit,
        costPerUnit: parseFloat(json.costPerUnit),
        currency: json.currency,
        location: json.location,
        notes: json.notes || null,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        materialOrderItems: {
          include: {
            order: true,
          },
        },
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error updating material" },
      { status: 500 }
    );
  }
}
// app/api/materials/[materialId]/route.ts
// app/api/materials/[materialId]/route.ts

export async function DELETE(
  request: Request,
  { params }: { params: { materialId: string } }
) {
  try {
    const materialId = params.materialId;

    // Check if material is used in any products or orders
    const materialInUse = await prisma.material.findFirst({
      where: {
        id: materialId,
        OR: [
          {
            products: {
              some: {}, // Check if used in any ProductMaterial
            },
          },
          {
            materialOrderItems: {
              some: {}, // Check if used in any MaterialOrderItem
            },
          },
        ],
      },
    });

    if (materialInUse) {
      return NextResponse.json(
        {
          message:
            "Cannot delete material because it is in use. This material is referenced in products or orders. Remove these references before deleting.",
        },
        { status: 400 }
      );
    }

    await prisma.material.delete({
      where: {
        id: materialId,
      },
    });

    return NextResponse.json({
      message: "Material deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { message: "Failed to delete material" },
      { status: 500 }
    );
  }
}
