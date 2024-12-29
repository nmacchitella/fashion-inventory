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
        inventory: {
          include: {
            movements: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
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

    // Ensure the product exists first
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update product using transaction to ensure data consistency
    const updatedProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          // Spread the json but explicitly remove relations to prevent unintended updates
          ...json,
          materials: undefined,
          inventory: undefined,
        },
        include: {
          materials: {
            include: {
              material: true,
            },
          },
          inventory: {
            include: {
              movements: true,
            },
          },
        },
      });

      return product;
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { 
        error: "Error updating product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
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

    // Check if product exists with all relevant relations
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        materials: true,
        inventory: {
          include: {
            movements: true,
          },
        },
      },
    });

    if (!product) {
      console.log("Product not found:", productId);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product has any inventory
    if (product.inventory.length > 0) {
      // Check if any inventory has movements
      const hasMovements = product.inventory.some(inv => inv.movements.length > 0);
      
      if (hasMovements) {
        return NextResponse.json(
          { error: "Cannot delete product with existing inventory movements" },
          { status: 400 }
        );
      }

      // If inventory exists but no movements, we can proceed but should warn
      console.warn("Deleting product with existing inventory but no movements:", productId);
    }

    // Use transaction to ensure all related records are deleted properly
    await prisma.$transaction(async (tx) => {
      // Delete all inventory movements first (if any exist)
      if (product.inventory.length > 0) {
        await tx.transactionItem.deleteMany({
          where: {
            inventory: {
              productId: productId,
            },
          },
        });
      }

      // Delete all inventory records
      await tx.inventory.deleteMany({
        where: {
          productId: productId,
        },
      });

      // Delete all product-material relationships
      await tx.productMaterial.deleteMany({
        where: {
          productId: productId,
        },
      });

      // Finally delete the product
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