// app/api/products/[productId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/products/[productId]
 * Fetch a single product by ID
 */
export async function GET(request: NextRequest, context) {
  try {
    const { productId } = context.params;

    console.log("GET request for product:", productId);

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

/**
 * PATCH /api/products/[productId]
 * Update an existing product
 */
export async function PATCH(request: NextRequest, context) {
  try {
    const { productId } = context.params;
    const json = await request.json();

    // Validate the payload
    if (!json) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    console.log("Received data:", json);

    // Ensure the product exists first
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Build a partial update object
    const dataToUpdate: Partial<typeof json> = {
      ...json,
      materials: undefined, // Exclude relations if necessary
      inventory: undefined, // Exclude relations if necessary
    };

    // Optional: Validate and sanitize dataToUpdate here
    // For example, ensure only allowed fields are being updated

    // Update product using transaction to ensure data consistency
    const updatedProduct = await prisma.$transaction(async (tx) => {
      console.log("Preparing to update product");
      console.log("Actual data sent to Prisma:", dataToUpdate);
      const product = await tx.product.update({
        where: { id: productId },
        data: dataToUpdate,
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
      console.log("Product updated successfully");
      return product;
    });

    console.log("Update transaction completed for product:", productId);

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

/**
 * DELETE /api/products/[productId]
 * Delete a product if it has no related inventory movements
 */
export async function DELETE(request: NextRequest, context) {
  try {
    const { productId } = context.params;

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
      const hasMovements = product.inventory.some(
        (inv) => inv.movements.length > 0
      );

      if (hasMovements) {
        return NextResponse.json(
          { error: "Cannot delete product with existing inventory movements" },
          { status: 400 }
        );
      }

      // If inventory exists but no movements, proceed with deletion
      console.warn(
        "Deleting product with existing inventory but no movements:",
        productId
      );
    }

    // Use transaction to ensure all related records are deleted properly
    await prisma.$transaction(async (tx) => {
      // Delete all inventory movements first (if any exist)
      if (product.inventory.length > 0) {
        await tx.movements.deleteMany({
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

      // Finally, delete the product
      await tx.product.delete({
        where: {
          id: productId,
        },
      });
    });

    console.log("Product and related records deleted successfully:", productId);
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
