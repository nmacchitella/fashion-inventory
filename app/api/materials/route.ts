import { prisma } from "@/app/lib/prisma";
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
    const material = await prisma.material.create({
      data: {
        type: json.type,
        color: json.color,
        brand: json.brand,
        quantity: json.quantity,
        location: json.location,
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
