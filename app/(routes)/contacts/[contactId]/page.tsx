"use client";

import { UpsertDialog } from "@/components/forms/upsert-dialog";
import { BackButton } from "@/components/ui/back-button";
import { DetailsView } from "@/components/ui/details-view";
import { DialogComponent } from "@/components/ui/dialog";
import { Contact } from "@/types/types";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

// Example contact form fields for your UpsertDialog
// Adjust to match your contact schema
const contactFields = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "email", label: "Email", type: "text", required: true },
  { key: "phone", label: "Phone", type: "text" },
  { key: "company", label: "Company", type: "text" },
  { key: "role", label: "Role", type: "text" },
  {
    key: "type",
    label: "Type",
    type: "select",
    options: ["SUPPLIER", "MANUFACTURER", "CUSTOMER"],
    required: true,
  },
  { key: "notes", label: "Notes", type: "textarea" },
];

// Fetch a single contact from your API:
async function fetchContact(contactId: string) {
  try {
    const response = await fetch(`/api/contacts/${contactId}`);
    if (!response.ok || response.status === 404) {
      notFound();
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching contact:", error);
    throw error;
  }
}

// Optional: helper to style the 'type' badge
function getContactTypeColor(type: string) {
  switch (type) {
    case "SUPPLIER":
      return "bg-blue-100 text-blue-800";
    case "MANUFACTURER":
      return "bg-purple-100 text-purple-800";
    case "CUSTOMER":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function ContactPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const router = useRouter();
  // Resolve the promise-based params in Next.js App Router
  const resolvedParams = use(params);

  // Local states
  const [contact, setContact] = useState<Contact | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Load the contact data once we have contactId
  useEffect(() => {
    fetchContact(resolvedParams.contactId).then(setContact);
  }, [resolvedParams.contactId]);

  // Handle "still loading" state
  if (!contact) {
    return <div>Loading...</div>;
  }

  // We’ll tell the UpsertDialog how to handle success
  const handleSaveSuccess = (updatedContact: Contact) => {
    setContact(updatedContact);
    setIsEditDialogOpen(false);
  };

  // Deletion can happen from the form or somewhere else
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete contact");
      }
      // If successful, go back to your main contacts page
      router.push("/contacts");
      router.refresh();
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  // Prepare data for the <DetailsView>
  const detailItems = [
    { label: "Name", value: contact.name },
    { label: "Email", value: contact.email },
    { label: "Phone", value: contact.phone || "Not provided" },
    { label: "Company", value: contact.company || "Not provided" },
    { label: "Role", value: contact.role || "Not provided" },
    {
      label: "Type",
      value: (
        <span
          className={`px-2 py-1 rounded-full text-sm ${getContactTypeColor(
            contact.type
          )}`}
        >
          {contact.type}
        </span>
      ),
    },
    { label: "Notes", value: contact.notes || "No notes" },
    {
      label: "Created At",
      value: new Date(contact.createdAt).toLocaleDateString(),
    },
    {
      label: "Updated At",
      value: new Date(contact.updatedAt).toLocaleDateString(),
    },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Contact Details</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditDialogOpen(true)}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Edit
            </button>
            <BackButton />
          </div>
        </div>
        {/* Detailed info */}
        <DetailsView title={contact.name} items={detailItems} />
      </div>

      {/* UpsertDialog for editing this contact */}
      {isEditDialogOpen && (
        <DialogComponent
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Edit Contact"
        >
          <UpsertDialog
            // Core props for the UpsertDialog
            mode="edit"
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={handleSaveSuccess}
            defaultData={contact}
            fields={contactFields}
            apiEndpoint="/api/contacts"
            itemName="Contact"
            // So the dialog's Delete button calls handleDelete
            onDeleteSuccess={(item) => handleDelete(item.id!)}
          />
        </DialogComponent>
      )}
    </>
  );
}
