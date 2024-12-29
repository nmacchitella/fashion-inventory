import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventory: true,
        materials: {
          include: {
            material: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error fetching products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();

    // Basic validation
    const requiredFields = ["sku", "piece", "name", "season", "phase"];
    for (const field of requiredFields) {
      if (!json[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create product with potential relationships
    const product = await prisma.$transaction(async (tx) => {
      // Create the base product
      const newProduct = await tx.product.create({
        data: {
          sku: json.sku,
          piece: json.piece,
          name: json.name,
          season: json.season,
          phase: json.phase,
          notes: json.notes || null,
          photos: json.photos || [],
        },
      });

      // Create inventory if provided
      if (json.inventory?.length) {
        await tx.inventory.createMany({
          data: json.inventory.map((inv: any) => ({
            type: "PRODUCT",
            productId: newProduct.id,
            quantity: inv.quantity,
            unit: inv.unit,
            location: inv.location,
          })),
        });
      }

      // Create material associations if provided
      if (json.materials?.length) {
        await tx.productMaterial.createMany({
          data: json.materials.map((mat: any) => ({
            productId: newProduct.id,
            materialId: mat.materialId,
            quantity: mat.quantity,
            unit: mat.unit,
          })),
        });
      }

      return newProduct;
    });

    // Fetch complete product with relations
    const productWithRelations = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        inventory: true,
        materials: {
          include: {
            material: true,
          },
        },
      },
    });

    return NextResponse.json(productWithRelations);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error creating product" },
      { status: 500 }
    );
  }
}
