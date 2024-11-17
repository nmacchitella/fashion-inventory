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
  request: Request,
  context: { params: Promise<{ materialId: string }> }
) {
  try {
    console.log("----1");
    // Await the params
    const { materialId } = await context.params;
    console.log("----2");

    if (!materialId) {
      return NextResponse.json(
        { message: "Material ID is required" },
        { status: 400 }
      );
    }
    console.log("----3");
    // Check if material exists
    const existingMaterial = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        _count: {
          select: {
            products: true,
            materialOrderItems: true,
          },
        },
      },
    });

    console.log("----4");

    if (!existingMaterial) {
      return NextResponse.json(
        { message: "Material not found" },
        { status: 404 }
      );
    }
    console.log("----5");
    // Check if material is used in any products or orders
    if (
      existingMaterial._count.products > 0 ||
      existingMaterial._count.materialOrderItems > 0
    ) {
      return new NextResponse(
        JSON.stringify({
          message: "Cannot delete material because it is in use",
          details: {
            productsCount: existingMaterial._count.products,
            ordersCount: existingMaterial._count.materialOrderItems,
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("----6");

    // Delete the material
    await prisma.material.delete({
      where: {
        id: materialId,
      },
    });

    return NextResponse.json(
      {
        message: "Material deleted successfully",
        deletedId: materialId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE API:", error);
    return NextResponse.json(
      {
        message: "Failed to delete material",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
