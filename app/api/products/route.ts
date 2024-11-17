import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
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

    // Validate required fields
    const requiredFields = ["sku", "piece", "name", "season", "phase"];

    for (const field of requiredFields) {
      if (!json[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.create({
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

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error creating product" },
      { status: 500 }
    );
  }
}
