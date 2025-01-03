// app/api/tools/calculate-materials/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { products } = body;

    // Fetch all product materials with their associated materials
    const productMaterials = await prisma.productMaterial.findMany({
      where: {
        productId: {
          in: products.map((p: { productId: string }) => p.productId),
        },
      },
      include: {
        material: true,
      },
    });

    // Calculate required quantities
    const materialRequirements = new Map();

    for (const { productId, quantity } of products) {
      const productMats = productMaterials.filter(pm => pm.productId === productId);
      
      for (const pm of productMats) {
        const key = pm.materialId;
        const currentReq = materialRequirements.get(key) || {
          material: pm.material,
          totalQuantity: 0,
          unit: pm.unit,
        };
        
        currentReq.totalQuantity += pm.quantity * quantity;
        materialRequirements.set(key, currentReq);
      }
    }

    return NextResponse.json(Array.from(materialRequirements.values()));
  } catch (error) {
    console.error("Error calculating materials:", error);
    return NextResponse.json(
      { error: "Failed to calculate material requirements" },
      { status: 500 }
    );
  }
}