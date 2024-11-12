"use client";

import { useState } from "react";
import { Contact, ContactType } from "@/types/contact";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { useRouter } from "next/navigation";

interface Column {
  header: string;
  accessorKey: string;
  cell?: (item: Contact) => React.ReactNode;
}

const columns: Column[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    header: "Phone",
    accessorKey: "phone",
  },
  {
    header: "Company",
    accessorKey: "company",
  },
  {
    header: "Role",
    accessorKey: "role",
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: (contact) => (
      <span
        className={`px-2 py-1 rounded-full text-sm ${getTypeColor(
          contact.type
        )}`}
      >
        {contact.type}
      </span>
    ),
  },
];

function getTypeColor(type: ContactType) {
  switch (type) {
    case ContactType.SUPPLIER:
      return 'bg-blue-100 text-blue-800';
    case ContactType.MANUFACTURER:
      return 'bg-purple-100 text-purple-800';
    case ContactType.CUSTOMER:
      return 'bg-green-100 text-green-800';
    case ContactType.OTHER:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function ContactsTable({ contacts: initialContacts }: { contacts: Contact[] }) {
  const router = useRouter();
  const [contacts] = useState(initialContacts);

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            {columns.map((column) => (
              <th
                key={column.accessorKey}
                className="px-4 py-2 text-left text-sm font-medium text-gray-500"
              >
                {column.header}
              </th>
            ))}
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id} className="border-b hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={`${contact.id}-${column.accessorKey}`}
                  className="px-4 py-2 text-sm"
                >
                  {column.cell
                    ? column.cell(contact)
                    : String(contact[column.accessorKey as keyof Contact] || '-')}
                </td>
              ))}
              <td className="px-4 py-2 text-sm">
                <DataTableRowActions
                  onView={() => router.push(`/contacts/${contact.id}`)}
                  onEdit={() => console.log('Edit:', contact.id)}
                  onDelete={() => console.log('Delete:', contact.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}