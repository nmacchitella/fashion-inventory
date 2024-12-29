import { prisma } from "@/lib/prisma";
import { ContactsControls } from "./contact-controls";

async function getContacts() {
  const contacts = await prisma.contact.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return contacts;
}

export default async function ContactsPage() {
  const initialContacts = await getContacts();

  return (
    <div className="space-y-4">
      <ContactsControls initialContacts={initialContacts} />
    </div>
  );
}
