import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Log available models
    console.log("Available Prisma models:", Object.keys(prisma));

    // Check if we can connect to the database
    await prisma.$connect();
    console.log("Successfully connected to database");

    // Try to count contacts first
    const contactCount = await prisma.contact.count();
    console.log("Number of contacts:", contactCount);

    // Get all contacts
    const contacts = await prisma.contact.findMany();
    console.log("Found contacts:", contacts);

    return NextResponse.json({
      success: true,
      contactCount,
      contacts,
      prismaModels: Object.keys(prisma),
    });
  } catch (error) {
    console.error("Debug API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        errorDetails: error,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
