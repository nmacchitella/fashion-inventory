import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const order = await prisma.materialOrder.findUnique({
      where: {
        id: params.orderId,
      },
      include: {
        orderItems: {
          include: {
            material: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error fetching order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const json = await request.json();

    // Convert string dates to Date objects
    const updateData = {
      ...json,
      orderDate: json.orderDate ? new Date(json.orderDate) : undefined,
      expectedDelivery: json.expectedDelivery
        ? new Date(json.expectedDelivery)
        : undefined,
      actualDelivery: json.actualDelivery
        ? new Date(json.actualDelivery)
        : null,
      totalPrice: json.totalPrice ? parseFloat(json.totalPrice) : undefined,
    };

    const order = await prisma.materialOrder.update({
      where: {
        id: params.orderId,
      },
      data: updateData,
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
      { error: "Error updating order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    // First, delete all associated order items
    await prisma.materialOrderItem.deleteMany({
      where: {
        orderId: params.orderId,
      },
    });

    // Then delete the order itself
    await prisma.materialOrder.delete({
      where: {
        id: params.orderId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error deleting order" },
      { status: 500 }
    );
  }
}
