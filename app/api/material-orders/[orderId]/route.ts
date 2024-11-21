import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { orderId: string } }
) {
  try {
    const order = await prisma.materialOrder.findUnique({
      where: {
        id: context.params.orderId,
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
  request: NextRequest,
  context: { params: { orderId: string } }
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
        id: context.params.orderId,
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
  request: NextRequest,
  context: { params: { orderId: string } }
) {
  try {
    // First, delete all associated order items
    const deletedItems = await prisma.materialOrderItem.deleteMany({
      where: {
        orderId: context.params.orderId,
      },
    });
    console.log("Deleted order items:", deletedItems);

    // Then delete the order itself
    const deletedOrder = await prisma.materialOrder.delete({
      where: {
        id: context.params.orderId,
      },
    });
    console.log("Deleted order:", deletedOrder);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Detailed error in DELETE API:", error);
    return NextResponse.json(
      {
        message: "Failed to delete order",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
