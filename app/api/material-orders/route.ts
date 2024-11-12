import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const orders = await prisma.materialOrder.findMany({
      include: {
        orderItems: {
          include: {
            material: true,
          },
        },
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error fetching orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();

    // Validate required fields
    const requiredFields = [
      "orderNumber",
      "supplier",
      "totalPrice",
      "currency",
      "orderDate",
      "expectedDelivery",
      "status",
    ];

    for (const field of requiredFields) {
      if (json[field] === undefined || json[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const order = await prisma.materialOrder.create({
      data: {
        orderNumber: json.orderNumber,
        supplier: json.supplier,
        totalPrice: parseFloat(json.totalPrice),
        currency: json.currency,
        orderDate: new Date(json.orderDate),
        expectedDelivery: new Date(json.expectedDelivery),
        actualDelivery: json.actualDelivery ? new Date(json.actualDelivery) : null,
        status: json.status,
        notes: json.notes || null,
      },
      include: {
        orderItems: {
          include: {
            material: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error creating order" },
      { status: 500 }
    );
  }
}