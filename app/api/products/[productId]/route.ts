import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
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
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
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
    const productId = params.productId;

    const product = await prisma.product.update({
      where: {
        id: productId,
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
    const productId = params.productId;

    console.log("Attempting to delete product:", productId);

    // First check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        materials: true,
      },
    });

    if (!product) {
      console.log("Product not found:", productId);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Use a transaction to ensure all operations complete successfully
    await prisma.$transaction(async (tx) => {
      // First delete all product-material relationships
      await tx.productMaterial.deleteMany({
        where: {
          productId: productId,
        },
      });

      // Then delete the product
      await tx.product.delete({
        where: {
          id: productId,
        },
      });
    });

    console.log("Product and related records deleted successfully");
    return NextResponse.json({
      message: "Product deleted successfully",
      id: productId,
    });
  } catch (error) {
    console.log("hello");
    console.error("Error during product deletion:", error);
    return NextResponse.json(
      {
        error: "Error deleting product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
