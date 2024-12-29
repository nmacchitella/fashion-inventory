import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      include: {
        inventory: true,
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error fetching materials" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();

    // Basic validation
    const requiredFields = [
      "type",
      "color",
      "colorCode",
      "brand",
      // "defaultUnit",
      // "defaultCostPerUnit",
      "currency",
    ];
    for (const field of requiredFields) {
      if (!json[field]) {
        console.log("missing", field);
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create material with potential relationships
    const material = await prisma.$transaction(async (tx) => {
      // Create the base material
      const newMaterial = await tx.material.create({
        data: {
          type: json.type,
          color: json.color,
          colorCode: json.colorCode,
          brand: json.brand,
          // defaultUnit: json.defaultUnit,
          // defaultCostPerUnit: parseFloat(json.defaultCostPerUnit),
          // currency: json.currency,
          notes: json.notes || null,
        },
      });

      // Create inventory if provided
      if (json.inventory?.length) {
        await tx.inventory.createMany({
          data: json.inventory.map((inv: any) => ({
            type: "MATERIAL",
            materialId: newMaterial.id,
            quantity: inv.quantity,
            unit: inv.unit,
            location: inv.location,
            notes: inv.notes,
          })),
        });
      }

      return newMaterial;
    });

    // Fetch complete material with relations
    const materialWithRelations = await prisma.material.findUnique({
      where: { id: material.id },
      include: {
        inventory: true,
        products: {
          include: {
            material: true,
          },
        },
      },
    });

    return NextResponse.json(materialWithRelations);
  } catch (error) {
    console.error("Error:", error);

    return NextResponse.json(
      { error: "Error creating material" },
      { status: 500 }
    );
  }
}
