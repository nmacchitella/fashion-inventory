import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const materials = await prisma.material.findMany();
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

    // Validate required fields
    const requiredFields = [
      "type",
      "color",
      "colorCode",
      "brand",
      "quantity",
      "unit",
      "costPerUnit",
      "currency",
      "location",
    ];

    for (const field of requiredFields) {
      // Changed validation to check for undefined or null
      if (json[field] === undefined || json[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Additional validation for numeric fields
    if (
      typeof json.quantity !== "number" &&
      typeof parseFloat(json.quantity) !== "number"
    ) {
      return NextResponse.json(
        { error: "Quantity must be a number" },
        { status: 400 }
      );
    }

    if (
      typeof json.costPerUnit !== "number" &&
      typeof parseFloat(json.costPerUnit) !== "number"
    ) {
      return NextResponse.json(
        { error: "Cost per unit must be a number" },
        { status: 400 }
      );
    }

    const material = await prisma.material.create({
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
        photos: json.photos || [],
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error creating material" },
      { status: 500 }
    );
  }
}
