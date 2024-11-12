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

export async function DELETE(
  _request: Request,
  { params }: { params: { materialId: string } }
) {
  try {
    // First, check if the material exists
    const material = await prisma.material.findUnique({
      where: {
        id: params.materialId,
      },
      include: {
        products: true,
        materialOrderItems: true,
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Check if material is being used in products or orders
    if (
      material.products.length > 0 ||
      material.materialOrderItems.length > 0
    ) {
      return NextResponse.json(
        {
          error: "Cannot delete material that is in use",
          details: {
            productsCount: material.products.length,
            ordersCount: material.materialOrderItems.length,
          },
        },
        { status: 400 }
      );
    }

    // If all checks pass, delete the material
    await prisma.material.delete({
      where: {
        id: params.materialId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error deleting material" },
      { status: 500 }
    );
  }
}
