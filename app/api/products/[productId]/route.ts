import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: params.productId,
      },
      include: {
        materials: {
          include: {
            material: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error fetching product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const json = await request.json();

    const product = await prisma.product.update({
      where: {
        id: params.productId,
      },
      data: json,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error updating product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    await prisma.product.delete({
      where: {
        id: params.productId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error deleting product" },
      { status: 500 }
    );
  }
}