import { ContactsTable } from "@/components/data-tables/contacts-table";
import { prisma } from "@/lib/prisma";
import { Contact, ContactType } from "@/types/contact";
import { Prisma } from "@prisma/client";

// Helper function to map Prisma ContactType to our local ContactType
function mapContactType(type: Prisma.ContactType): ContactType {
  switch (type) {
    case "SUPPLIER":
      return ContactType.SUPPLIER;
    case "MANUFACTURER":
      return ContactType.MANUFACTURER;
    case "CUSTOMER":
      return ContactType.CUSTOMER;
    case "OTHER":
      return ContactType.OTHER;
    default:
      return ContactType.OTHER;
  }
}

async function getContacts(): Promise<Contact[]> {
  if (!prisma) {
    console.error("Prisma client is not initialized");
    throw new Error("Database client not initialized");
  }

  try {
    // First check if we can connect to the database
    await prisma.$connect();

    // Then try to get the contacts
    const contacts = await prisma.contact.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Fetched contacts:", contacts); // Debug log

    return contacts.map((contact) => ({
      ...contact,
      type: mapContactType(contact.type),
      createdAt: new Date(contact.createdAt),
      updatedAt: new Date(contact.updatedAt),
    }));
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw new Error(
      `Failed to fetch contacts: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  } finally {
    // Always disconnect after the operation
    await prisma.$disconnect();
  }
}

export default async function ContactsPage() {
  try {
    const contacts = await getContacts();

    if (!Array.isArray(contacts)) {
      console.error("Contacts is not an array:", contacts);
      throw new Error("Invalid contacts data format");
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Contacts</h1>
          <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
            Add Contact
          </button>
        </div>

        <ContactsTable contacts={contacts} />
      </div>
    );
  } catch (error) {
    console.error("Error in ContactsPage:", error);
    return (
      <div className="p-4 rounded-md bg-red-50 text-red-800">
        <h2 className="text-lg font-semibold mb-2">Error loading contacts</h2>
        <p>
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred"}
        </p>
      </div>
    );
  }
}
