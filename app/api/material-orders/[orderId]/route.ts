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
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    // Check if order exists and get its status
    const { orderId } = await context.params;

    const order = await prisma.materialOrder.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // // Don't allow deletion of shipped/delivered orders
    // if (order.status === "SHIPPED" || order.status === "DELIVERED") {
    //   return NextResponse.json(
    //     { message: `Cannot delete ${order.status.toLowerCase()} orders` },
    //     { status: 409 }
    //   );
    // }

    // Delete order and its items in a transaction
    await prisma.$transaction([
      prisma.materialOrderItem.deleteMany({
        where: { orderId: orderId },
      }),
      prisma.materialOrder.delete({
        where: { id: orderId },
      }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete order error:", {
      orderId: context.params.orderId,
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json(
      { message: "Failed to delete order" },
      { status: 500 }
    );
  }
}
