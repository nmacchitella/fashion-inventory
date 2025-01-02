// app/api/contacts/[contactId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context) {
  try {
    const { contactId } = context.params;

    const contact = await prisma.contact.findUnique({
      where: {
        id: contactId,
      },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    return NextResponse.json(
      { error: "Error fetching contact" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context) {
  try {
    const json = await request.json();
    const { contactId } = context.params;

    // Ensure the contact exists first
    const existingContact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!existingContact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // If email is being updated, validate format and uniqueness
    if (json.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(json.email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }

      // Check for existing contact with same email, excluding current contact
      const existingEmailContact = await prisma.contact.findFirst({
        where: {
          email: json.email,
          NOT: {
            id: contactId,
          },
        },
      });

      if (existingEmailContact) {
        return NextResponse.json(
          { error: "A contact with this email already exists" },
          { status: 400 }
        );
      }
    }

    // Update contact
    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        name: json.name,
        email: json.email,
        phone: json.phone,
        company: json.company,
        role: json.role,
        type: json.type,
        notes: json.notes,
      },
    });

    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      {
        error: "Error updating contact",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context) {
  try {
    const { contactId } = context.params;

    console.log("Attempting to delete contact:", contactId);

    // Check if contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      console.log("Contact not found:", contactId);
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Delete the contact
    await prisma.contact.delete({
      where: {
        id: contactId,
      },
    });

    console.log("Contact deleted successfully");
    return NextResponse.json({
      message: "Contact deleted successfully",
      id: contactId,
    });
  } catch (error) {
    console.error("Error during contact deletion:", error);
    return NextResponse.json(
      {
        error: "Error deleting contact",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
