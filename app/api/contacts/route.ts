// app/api/contacts/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error fetching contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();

    // Basic validation
    const requiredFields = ["name", "email", "type"];
    for (const field of requiredFields) {
      if (!json[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(json.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check for existing contact with same email
    const existingContact = await prisma.contact.findUnique({
      where: { email: json.email },
    });

    if (existingContact) {
      return NextResponse.json(
        { error: "A contact with this email already exists" },
        { status: 400 }
      );
    }

    // Create contact
    const contact = await prisma.contact.create({
      data: {
        name: json.name,
        email: json.email,
        phone: json.phone || null,
        company: json.company || null,
        role: json.role || null,
        type: json.type,
        notes: json.notes || null,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        error: "Error creating contact",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
