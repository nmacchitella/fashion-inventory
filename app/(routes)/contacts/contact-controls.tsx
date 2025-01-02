"use client";

import { DataTable, type DataTableColumn } from "@/components/data-table";
import { UpsertDialog } from "@/components/forms/upsert-dialog"; // same generic dialog used by products/materials
import { Contact, ContactType, FormField } from "@/types/types";
import { useState } from "react";

const contactColumns: DataTableColumn<Contact>[] = [
  { header: "Name", accessorKey: "name" },
  { header: "Email", accessorKey: "email" },
  { header: "Phone", accessorKey: "phone" },
  { header: "Type", accessorKey: "type" },
  { header: "Company", accessorKey: "company" },
];

// Define the fields for the dialog’s edit form:
const contactFields: FormField<Contact>[] = [
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

// Default contact data for creating a new contact:
const defaultContact: Partial<Contact> = {
  name: "",
  email: "",
  phone: "",
  type: ContactType.CUSTOMER, // or "" if you want no default
  company: "",
  notes: "",
};

interface ContactsControlsProps {
  initialContacts: Contact[];
}

export function ContactsControls({ initialContacts }: ContactsControlsProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);

  // Dialog state: whether open, the mode ("create" or "edit"), and which contact is selected
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // ---- CRUD Handlers ----

  // Create: open the dialog in "create" mode
  const handleCreate = () => {
    setSelectedContact(null);
    setDialogMode("create");
    setIsDialogOpen(true);
  };

  // Update: open the dialog in "edit" mode with the selected contact
  const handleUpdate = (contact: Contact) => {
    setSelectedContact(contact);
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  // After a successful save (create or edit)
  const handleSaveSuccess = (upsertedContact: Contact) => {
    setContacts((prev) => {
      // If the contact already exists, replace it
      const existingIndex = prev.findIndex((c) => c.id === upsertedContact.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = upsertedContact;
        return updated;
      }
      // Otherwise, new contact, prepend it
      return [upsertedContact, ...prev];
    });
    setIsDialogOpen(false);
  };

  // Deletion
  const handleDelete = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete contact");
      }
      // Remove from state
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Add Contact
        </button>
      </div>

      <DataTable
        data={contacts}
        columns={contactColumns}
        // The row "Delete" action
        onDelete={(contactId) => handleDelete(contactId)}
        // The row "Edit" action
        onUpdate={handleUpdate}
        viewPath="/contacts"
      />

      {/* Reuse your generic UpsertDialog (create/edit) */}
      {isDialogOpen && (
        <UpsertDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          mode={dialogMode}
          // Base API endpoint for create/edit
          apiEndpoint="/api/contacts"
          itemName="Contact"
          fields={contactFields}
          // If there's a selected contact in "edit" mode, show it; else default blank
          defaultData={selectedContact || defaultContact}
          onSuccess={handleSaveSuccess}
          // So the form can display a delete button in "edit" mode
          onDeleteSuccess={(item) => handleDelete(item.id!)}
        />
      )}
    </>
  );
}
