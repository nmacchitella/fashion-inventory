# .eslintrc.json

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}

```

# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

```

# .vscode/extensions.json

```json
{
  "recommendations": [
    // Core Extensions
    "dbaeumer.vscode-eslint",                 // ESLint
    "esbenp.prettier-vscode",                 // Prettier
    "bradlc.vscode-tailwindcss",             // Tailwind CSS IntelliSense
    "Prisma.prisma",                         // Prisma
    "ms-vscode.vscode-typescript-next",      // TypeScript Nightly
    
    // React/Next.js
    "dsznajder.es7-react-js-snippets",      // React Snippets
    "formulahendry.auto-rename-tag",         // Auto Rename Tag
    
    // Git
    "eamodio.gitlens",                      // GitLens
    "mhutchie.git-graph",                   // Git Graph
    
    // Productivity
    "christian-kohler.path-intellisense",    // Path Intellisense
    "streetsidesoftware.code-spell-checker", // Code Spell Checker
    "naumovs.color-highlight",               // Color Highlight
    "wayou.vscode-todo-highlight",           // TODO Highlight
    
    // Testing
    "Orta.vscode-jest",                     // Jest
    
    // Icons
    "pkief.material-icon-theme"             // Material Icon Theme
  ]
}
```

# .vscode/settings.json

```json
{
    // Editor Configuration
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit",
      "source.organizeImports": "explicit"
    },
    "editor.quickSuggestions": {
      "strings": "on"
    },
    "editor.rulers": [100],
    "editor.tabSize": 2,
    "editor.wordWrap": "on",
    
    // TypeScript Configuration
    "typescript.preferences.importModuleSpecifier": "non-relative",
    "typescript.suggest.autoImports": true,
    "typescript.updateImportsOnFileMove.enabled": "always",
    
    // Tailwind CSS Configuration
    "tailwindCSS.experimental.classRegex": [
      ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
      ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
    ],
    "tailwindCSS.includeLanguages": {
      "typescript": "javascript",
      "typescriptreact": "javascript"
    },
    
    // File Associations
    "files.associations": {
      "*.css": "tailwindcss",
      "*.scss": "tailwindcss"
    },
    
    // Prisma Configuration
    "[prisma]": {
      "editor.defaultFormatter": "Prisma.prisma"
    },
    
    // Git Configuration
    "git.enableSmartCommit": true,
    "git.confirmSync": false,
    
    // Path Intelligence
    "javascript.preferences.importModuleSpecifier": "non-relative",
    "path-intellisense.mappings": {
      "@": "${workspaceRoot}/app"
    },
    
    // File Exclusions
    "files.exclude": {
      "**/.git": true,
      "**/.svn": true,
      "**/.hg": true,
      "**/CVS": true,
      "**/.DS_Store": true,
      "**/node_modules": true
    }
  }
```

# app/(routes)/contacts/[contactId]/page.tsx

```tsx
"use client";

// import { ContactEditForm } from "@/components/forms/contact-edit-form";
import { BackButton } from "@/components/ui/back-button";
import { DetailsView } from "@/components/ui/details-view";
import { DialogComponent } from "@/components/ui/dialog";
import { Contact } from "@/types/types";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

async function getContact(contactId: string) {
  try {
    const response = await fetch(`/api/contacts/${contactId}`);
    const data = await response.json();

    if (!data || response.status === 404) {
      notFound();
    }

    return data;
  } catch (error) {
    console.error("Error fetching contact:", error);
    throw error;
  }
}

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
  const resolvedParams = use(params);
  const [contact, setContact] = useState<Contact | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    getContact(resolvedParams.contactId).then(setContact);
  }, [resolvedParams.contactId]);

  if (!contact) {
    return <div>Loading...</div>;
  }

  const handleSave = async (updatedContact: Partial<Contact>) => {
    try {
      const response = await fetch(
        `/api/contacts/${resolvedParams.contactId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedContact),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update contact");
      }

      const updated = await response.json();
      setContact(updated);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  const handleDelete = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete contact");
      }
      router.push("/contacts");
      router.refresh();
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  };

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
        <DetailsView title={contact.name} items={detailItems} />
      </div>

      <DialogComponent
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Contact"
      >
        {/* <ContactEditForm
          contact={contact}
          onSaveSuccess={handleSave}
          onDeleteSuccess={handleDelete}
          onCancel={() => setIsEditDialogOpen(false)}
          mode="edit"
        /> */}
      </DialogComponent>
    </>
  );
}

```

# app/(routes)/contacts/contact-controls.tsx

```tsx
"use client";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/data-tables/data-table";
import { EditForm } from "@/components/forms/edit-form";
import { Contact } from "@/types/types";
import { useState } from "react";

// Column definitions
const contactColumns: DataTableColumn<Contact>[] = [
  { header: "Name", accessorKey: "name" },
  { header: "Email", accessorKey: "email" },
  { header: "Phone", accessorKey: "phone" },
  { header: "Type", accessorKey: "type" },
  { header: "Company", accessorKey: "company" },
];

interface ContactsControlsProps {
  initialContacts: Contact[];
}

export function ContactsControls({ initialContacts }: ContactsControlsProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete contact");
      }

      setContacts((prevContacts) =>
        prevContacts.filter((c) => c.id !== contactId)
      );
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  };

  const handleUpdate = (updatedContact: Contact) => {
    setContacts((prevContacts) =>
      prevContacts.map((c) => (c.id === updatedContact.id ? updatedContact : c))
    );
    setIsEditing(false);
  };

  const handleAddSuccess = (newContact: Contact) => {
    setContacts((prevContacts) => [newContact, ...prevContacts]);
    setIsEditing(false);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <button
          onClick={() => {
            setSelectedContact(null);
            setIsEditing(true);
          }}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Add Contact
        </button>
      </div>

      <DataTable
        data={contacts}
        columns={contactColumns}
        onDelete={handleDelete}
        onUpdate={(contact) => {
          setSelectedContact(contact);
          setIsEditing(true);
        }}
        viewPath="/contacts"
      />

      {isEditing && (
        <EditForm
          mode={selectedContact ? "edit" : "create"}
          initialData={
            selectedContact || {
              id: "",
              name: "",
              email: "",
              phone: "",
              type: "",
              company: "",
            }
          }
          fields={[
            { key: "name", label: "Name", type: "text", required: true },
            { key: "email", label: "Email", type: "text", required: true },
            { key: "phone", label: "Phone", type: "text", required: true },
            { key: "type", label: "Type", type: "text", required: true },
            { key: "company", label: "Company", type: "text" },
          ]}
          onSaveSuccess={(contact) =>
            selectedContact ? handleUpdate(contact) : handleAddSuccess(contact)
          }
          onDeleteSuccess={handleDelete}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </>
  );
}

```

# app/(routes)/contacts/loading.tsx

```tsx
export default function InventoryLoading() {
  return (
    <div className="w-full h-24 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
}

```

# app/(routes)/contacts/page.tsx

```tsx
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

```

# app/(routes)/dashboard/loading.tsx

```tsx
export default function DashboardLoading() {
  return (
    <div className="w-full h-24 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
}

```

# app/(routes)/dashboard/page.tsx

```tsx
// app/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { AlertCircle, Box, Clock, Shirt } from "lucide-react";

// Function to fetch dashboard data
async function getDashboardData() {
  const materials = await prisma.material.findMany();
  const styles = await prisma.product.findMany({
    take: 5, // Last 5 styles
    orderBy: { createdAt: "desc" },
  });

  return {
    totalMaterials: materials.length,
    materials,
    recentStyles: styles,
    // Add more aggregations as needed
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Box className="w-5 h-5 text-blue-500" />
            <h3 className="text-gray-500">Total Materials</h3>
          </div>
          <p className="text-2xl font-semibold mt-2">{data.totalMaterials}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Shirt className="w-5 h-5 text-green-500" />
            <h3 className="text-gray-500">Active Styles</h3>
          </div>
          <p className="text-2xl font-semibold mt-2">
            {data.recentStyles.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <h3 className="text-gray-500">Pending Tasks</h3>
          </div>
          <p className="text-2xl font-semibold mt-2">--</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-gray-500">Alerts</h3>
          </div>
          <p className="text-2xl font-semibold mt-2">--</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Styles */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Recent Styles</h2>
          <div className="space-y-4">
            {data.recentStyles.map((style) => (
              <div
                key={style.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium">{style.name}</p>
                  <p className="text-sm text-gray-500">{style.phase}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(style.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Materials */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Low Stock Materials</h2>
          <div className="space-y-4">
            {data.materials
              .filter((m) => m.quantity < 100) // Example threshold
              .map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{material.type}</p>
                    <p className="text-sm text-gray-500">{material.color}</p>
                  </div>
                  <span
                    className={`text-sm ${
                      material.quantity < 50
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {material.quantity} {material.unit}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

```

# app/(routes)/inventory/loading.tsx

```tsx
export default function InventoryLoading() {
  return (
    <div className="w-full h-24 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
}

```

# app/(routes)/inventory/materials/[materialId]/page.tsx

```tsx
"use client";

import { MaterialEditForm } from "@/components/forms/material-edit-form";
import { BackButton } from "@/components/ui/back-button";
import { DetailsView } from "@/components/ui/details-view";
import { DialogComponent } from "@/components/ui/dialog";
import { Material } from "@/types/types";
import { notFound, useRouter } from "next/navigation"; // Add this import
import { use, useEffect, useState } from "react";

async function getMaterial(materialId: string) {
  const material = await fetch(`/api/materials/${materialId}`).then((res) =>
    res.json()
  );
  if (!material) {
    notFound();
  }
  return material;
}

export default function MaterialPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [material, setMaterial] = useState<Material | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    getMaterial(resolvedParams.materialId).then(setMaterial);
  }, [resolvedParams.materialId]);

  if (!material) {
    return <div>Loading...</div>;
  }

  const handleSave = async (updatedMaterial: Partial<Material>) => {
    try {
      const response = await fetch(
        `/api/materials/${resolvedParams.materialId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedMaterial),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update material");
      }

      const updated = await response.json();

      setMaterial(updated);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating material:", error);
    }
  };

  const handleDelete = async (materialId: string) => {
    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Get the error message from the API if available
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete material");
      }
      router.push("/inventory");
      router.refresh();
    } catch (error) {
      console.error("Error deleting material:", error);
      throw error; // Propagate error to MaterialEditForm
    }
  };

  // const handleDeleteSuccess = () => {
  //   router.push("/inventory");
  //   router.refresh();
  // };

  const detailItems = [
    { label: "Type", value: material.type },
    {
      label: "Color",
      value: (
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: material.colorCode }}
          />
          {material.color}
        </div>
      ),
    },
    { label: "Color Code", value: material.colorCode },
    { label: "Brand", value: material.brand },
    { label: "Quantity", value: `${material.quantity} ${material.unit}` },
    {
      label: "Cost Per Unit",
      value: `${material.costPerUnit} ${material.currency}`,
    },
    { label: "Location", value: material.location },
    { label: "Notes", value: material.notes || "No notes" },
    {
      label: "Created At",
      value: new Date(material.createdAt).toLocaleDateString(),
    },
    {
      label: "Updated At",
      value: new Date(material.updatedAt).toLocaleDateString(),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Material Details</h1>
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
        <DetailsView
          title={`${material.type} - ${material.color}`}
          items={detailItems}
        />
      </div>

      <DialogComponent
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Material"
      >
        <MaterialEditForm
          material={material}
          onSaveSuccess={handleSave}
          onDeleteSuccess={handleDelete}
          onCancel={() => setIsEditDialogOpen(false)}
          mode="edit"
        />
      </DialogComponent>
    </>
  );
}

```

# app/(routes)/inventory/materials/material-controls.tsx

```tsx
// app/inventory/material-controls.tsx
"use client";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/data-tables/data-table";
import { AddMaterialDialog } from "@/components/forms/add-material-dialog";
import { Material } from "@/types/types";
import { useState } from "react";

// Column definitions
const materialColumns: DataTableColumn<Material>[] = [
  { header: "Type", accessorKey: "type" },
  {
    header: "Color",
    accessorKey: "color",
    cell: (material) => (
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: material.colorCode }}
        />
        {material.color}
      </div>
    ),
  },
  {
    header: "Quantity",
    accessorKey: "defaultUnit",
    cell: (material) => {
      const inventory = material.inventory?.[0];
      return inventory
        ? `${inventory.quantity} ${inventory.unit}`
        : "No inventory";
    },
  },
  { header: "Brand", accessorKey: "brand" },
  {
    header: "Cost",
    accessorKey: "defaultCostPerUnit",
    cell: (material) => `${material.defaultCostPerUnit} ${material.currency}`,
  },
];

interface MaterialControlsProps {
  initialMaterials: Material[];
}

export function MaterialControls({ initialMaterials }: MaterialControlsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [materials, setMaterials] = useState(initialMaterials);

  const handleAddSuccess = (newMaterial: Material) => {
    setMaterials((prevMaterials) => [newMaterial, ...prevMaterials]);
    setIsAddDialogOpen(false);
  };

  const handleDelete = async (materialId: string) => {
    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete material");
      }

      setMaterials((prevMaterials) =>
        prevMaterials.filter((m) => m.id !== materialId)
      );
    } catch (error) {
      console.error("Error deleting material:", error);
      throw error;
    }
  };

  const handleUpdate = (updatedMaterial: Material) => {
    setMaterials((prevMaterials) =>
      prevMaterials.map((m) =>
        m.id === updatedMaterial.id ? updatedMaterial : m
      )
    );
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Material Inventory</h1>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Add Material
        </button>
      </div>

      <DataTable
        data={materials}
        columns={materialColumns}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        viewPath="/inventory/materials"
      />

      <AddMaterialDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleAddSuccess}
      />
    </>
  );
}

```

# app/(routes)/inventory/materials/page.tsx

```tsx
// app/inventory/page.tsx
import { prisma } from "@/lib/prisma";
import { MaterialControls } from "./material-controls";

async function getInventory() {
  const materials = await prisma.material.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return materials;
}

export default async function InventoryPage() {
  const initialMaterials = await getInventory();

  return (
    <div className="space-y-4">
      <MaterialControls initialMaterials={initialMaterials} />
    </div>
  );
}

```

# app/(routes)/inventory/page.tsx

```tsx
// app/inventory/page.tsx
import Link from "next/link";

export default function InventoryPage() {
  const inventories = [
    {
      title: "Materials",
      description: "Track and manage material orders and their status",
      href: "/inventory/materials",
      icon: "📦", // We can replace this with a proper icon
      stats: {
        active: 5, // These could be real numbers from your DB
        pending: 2,
      },
    },
    {
      title: "Products",
      description: "Track and manage material orders and their status",
      href: "/inventory/products",
      icon: "📦", // We can replace this with a proper icon
      stats: {
        active: 5, // These could be real numbers from your DB
        pending: 2,
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventories.map((inventory) => (
          <Link
            key={inventory.title}
            href={inventory.href}
            className="block p-6 bg-white rounded-lg border hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{inventory.icon}</div>
              <div>
                <h3 className="text-lg font-semibold">{inventory.title}</h3>
                <p className="text-sm text-gray-500">{inventory.description}</p>
              </div>
            </div>

            {inventory.stats && (
              <div className="mt-4 flex space-x-4">
                <div className="text-sm">
                  <span className="font-medium text-green-600">
                    {inventory.stats.active}
                  </span>
                  <span className="text-gray-500"> active</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-yellow-600">
                    {inventory.stats.pending}
                  </span>
                  <span className="text-gray-500"> pending</span>
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

```

# app/(routes)/inventory/products/[productId]/page.tsx

```tsx
"use client";

import { ProductEditForm } from "@/components/forms/product-edit-form";
import { BackButton } from "@/components/ui/back-button";
import { DetailsView } from "@/components/ui/details-view";
import { DialogComponent } from "@/components/ui/dialog";
import { Product } from "@/types/product";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

async function getProduct(productId: string) {
  try {
    const response = await fetch(`/api/products/${productId}`);
    const data = await response.json();

    if (!data || response.status === 404) {
      notFound();
    }

    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    getProduct(resolvedParams.productId).then(setProduct);
  }, [resolvedParams.productId]);

  if (!product) {
    return <div>Loading...</div>;
  }

  const handleSave = async (updatedProduct: Partial<Product>) => {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      const updated = await response.json();
      setProduct(updated);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      router.push("/products");
      router.refresh();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const detailItems = [
    { label: "SKU", value: product.sku },
    { label: "Piece", value: product.piece },
    { label: "Name", value: product.name },
    { label: "Season", value: product.season },
    {
      label: "Phase",
      value: (
        <span
          className={`px-2 py-1 rounded-full text-sm ${getPhaseColor(
            product.phase
          )}`}
        >
          {product.phase}
        </span>
      ),
    },
    {
      label: "Materials",
      value: (
        <div className="space-y-2">
          {product.materials?.map((pm) => (
            <div key={pm.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: pm.material.colorCode }}
              />
              <span>
                {pm.material.type} - {pm.material.color}
              </span>
              <span className="text-gray-500">
                ({pm.quantity} {pm.unit})
              </span>
            </div>
          ))}
        </div>
      ),
    },
    { label: "Notes", value: product.notes || "No notes" },
    {
      label: "Created At",
      value: new Date(product.createdAt).toLocaleDateString(),
    },
    {
      label: "Updated At",
      value: new Date(product.updatedAt).toLocaleDateString(),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Product Details</h1>
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
        <DetailsView
          title={`${product.piece} - ${product.name}`}
          items={detailItems}
        />
      </div>

      {isEditDialogOpen && (
        <DialogComponent
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Edit Product"
        >
          <ProductEditForm
            product={product}
            onSaveSuccess={handleSave}
            onDeleteSuccess={handleDelete}
            onCancel={() => setIsEditDialogOpen(false)}
            mode="edit"
          />
        </DialogComponent>
      )}
    </>
  );
}

function getPhaseColor(phase: string) {
  switch (phase) {
    case "SWATCH":
      return "bg-blue-100 text-blue-800";
    case "INITIAL_SAMPLE":
      return "bg-yellow-100 text-yellow-800";
    case "FIT_SAMPLE":
      return "bg-purple-100 text-purple-800";
    case "PRODUCTION_SAMPLE":
      return "bg-orange-100 text-orange-800";
    case "PRODUCTION":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

```

# app/(routes)/inventory/products/loading.tsx

```tsx
export default function ProductsLoading() {
  return (
    <div className="w-full h-24 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
}

```

# app/(routes)/inventory/products/page.tsx

```tsx
import { prisma } from "@/lib/prisma";
import { ProductsControls } from "./products-controls";

async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return products;
}

export default async function ProductsPage() {
  const initialProducts = await getProducts();

  return (
    <div className="space-y-4">
      <ProductsControls initialProducts={initialProducts} />
    </div>
  );
}

```

# app/(routes)/inventory/products/products-controls.tsx

```tsx
"use client";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/data-tables/data-table";
import { AddProductDialog } from "@/components/forms/add-product-dialog";
import { Product } from "@/types/types";
import { useState } from "react";

// Column definitions
const productColumns: DataTableColumn<Product>[] = [
  { header: "SKU", accessorKey: "sku" },
  { header: "Piece", accessorKey: "piece" },
  { header: "Name", accessorKey: "name" },
  { header: "Season", accessorKey: "season" },
  {
    header: "Phase",
    accessorKey: "phase",
    cell: (product) => (
      <span
        className={`px-2 py-1 rounded-full text-sm ${getPhaseColor(
          product.phase
        )}`}
      >
        {product.phase}
      </span>
    ),
  },
];

function getPhaseColor(phase: string) {
  switch (phase) {
    case "SWATCH":
      return "bg-blue-100 text-blue-800";
    case "INITIAL_SAMPLE":
      return "bg-yellow-100 text-yellow-800";
    case "FIT_SAMPLE":
      return "bg-purple-100 text-purple-800";
    case "PRODUCTION_SAMPLE":
      return "bg-orange-100 text-orange-800";
    case "PRODUCTION":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

interface ProductsControlsProps {
  initialProducts: Product[];
}

export function ProductsControls({ initialProducts }: ProductsControlsProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete product");
      }

      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== productId)
      );
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  const handleUpdate = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleAddSuccess = (newProduct: Product) => {
    setProducts((prevProducts) => [newProduct, ...prevProducts]);
    setIsAddDialogOpen(false);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Add Product
        </button>
      </div>

      <DataTable
        data={products}
        columns={productColumns}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        viewPath="/inventory/products"
      />

      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleAddSuccess}
      />
    </>
  );
}

```

# app/(routes)/operations/loading.tsx

```tsx
export default function OperationsLoading() {
  return (
    <div className="w-full h-24 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
}

```

# app/(routes)/operations/material-orders/[orderId]/page.tsx

```tsx
"use client";

import { MaterialOrderEditForm } from "@/components/forms/material-order-edit-form";
import { BackButton } from "@/components/ui/back-button";
import { DetailsView } from "@/components/ui/details-view";
import { DialogComponent } from "@/components/ui/dialog";
import { MaterialOrder, OrderStatus } from "@/types/materialOrder";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

async function getOrder(orderId: string) {
  try {
    const response = await fetch(`/api/material-orders/${orderId}`);
    const data = await response.json();

    if (!data || response.status === 404) {
      notFound();
    }

    return data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case OrderStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    case OrderStatus.CONFIRMED:
      return "bg-blue-100 text-blue-800";
    case OrderStatus.SHIPPED:
      return "bg-purple-100 text-purple-800";
    case OrderStatus.DELIVERED:
      return "bg-green-100 text-green-800";
    case OrderStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [order, setOrder] = useState<MaterialOrder | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    getOrder(resolvedParams.orderId).then(setOrder);
  }, [resolvedParams.orderId]);

  if (!order) {
    return <div>Loading...</div>;
  }

  const handleSave = async (updatedOrder: Partial<MaterialOrder>) => {
    try {
      const response = await fetch(`/api/material-orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedOrder),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      const updated = await response.json();
      setOrder(updated);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/material-orders/${order.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      router.push("/operations/material-orders");
      router.refresh();
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const detailItems = [
    { label: "Order Number", value: order.orderNumber },
    { label: "Supplier", value: order.supplier },
    {
      label: "Status",
      value: (
        <span
          className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
            order.status
          )}`}
        >
          {order.status}
        </span>
      ),
    },
    { label: "Total Price", value: `${order.totalPrice} ${order.currency}` },
    {
      label: "Order Date",
      value: new Date(order.orderDate).toLocaleDateString(),
    },
    {
      label: "Expected Delivery",
      value: new Date(order.expectedDelivery).toLocaleDateString(),
    },
    {
      label: "Actual Delivery",
      value: order.actualDelivery
        ? new Date(order.actualDelivery).toLocaleDateString()
        : "Not delivered yet",
    },
    {
      label: "Order Items",
      value: (
        <div className="space-y-2">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: item.material.colorCode }}
              />
              <span>
                {item.material.type} - {item.material.color}
              </span>
              <span className="text-gray-500">
                ({item.quantity} {item.unit} @ {item.unitPrice} {order.currency}
                )
              </span>
              <span className="text-gray-500">
                Total: {item.totalPrice} {order.currency}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    { label: "Notes", value: order.notes || "No notes" },
    {
      label: "Created At",
      value: new Date(order.createdAt).toLocaleDateString(),
    },
    {
      label: "Updated At",
      value: new Date(order.updatedAt).toLocaleDateString(),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Order Details</h1>
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
        <DetailsView title={`Order ${order.orderNumber}`} items={detailItems} />
      </div>

      <DialogComponent
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Order"
      >
        <MaterialOrderEditForm
          order={order}
          onSaveSuccess={handleSave}
          onDeleteSuccess={handleDelete}
          onCancel={() => setIsEditDialogOpen(false)}
          mode="edit"
        />
      </DialogComponent>
    </>
  );
}

```

# app/(routes)/operations/material-orders/loading.tsx

```tsx
export default function MaterialOrdersLoading() {
  return (
    <div className="w-full h-24 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
}

```

# app/(routes)/operations/material-orders/material-orders-controls.tsx

```tsx
"use client";

import { MaterialOrdersTable } from "@/components/data-tables/materials-orders-table";
import { AddMaterialOrderDialog } from "@/components/forms/add-material-order-dialog";
import { MaterialOrder } from "@/types/materialOrder";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface MaterialOrdersControlsProps {
  initialOrders: MaterialOrder[];
}

export function MaterialOrdersControls({
  initialOrders,
}: MaterialOrdersControlsProps) {
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [orders, setOrders] = useState(initialOrders);

  const handleAddSuccess = (newOrder: MaterialOrder) => {
    console.log("New order before setState:", newOrder);
    setOrders((prevOrders) => {
      console.log("Previous orders:", prevOrders);
      const newOrders = [newOrder, ...prevOrders];
      console.log("New orders array:", newOrders);
      return newOrders;
    });
    setIsAddDialogOpen(false);
    router.refresh(); // Refresh server-side data
  };

  const handleDelete = async (orderId: string) => {
    try {
      const response = await fetch(`/api/material-orders/${orderId}`, {
        method: "DELETE",
      });

      // Since we're returning 204 No Content, we shouldn't try to parse the response
      if (response.status === 204) {
        setOrders((prevOrders) => prevOrders.filter((o) => o.id !== orderId));
        router.refresh(); // Refresh server-side data
        return; // Exit early on success
      }

      // If we got a different status, try to get error details
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to delete order");
    } catch (error) {
      console.error("Error deleting order:", error);
      // Instead of re-throwing the error, we could show a toast notification
      throw new Error(
        "Failed to delete order: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const handleUpdate = (updatedOrder: MaterialOrder) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
    router.refresh(); // Refresh server-side data
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Material Orders</h1>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Add Material Order
        </button>
      </div>

      <MaterialOrdersTable
        orders={orders}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />

      <AddMaterialOrderDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleAddSuccess}
      />
    </>
  );
}

```

# app/(routes)/operations/material-orders/page.tsx

```tsx
// app/routes/operations/material-orders/page.tsx
import { prisma } from "@/lib/prisma";
import { MaterialOrdersControls } from "./material-orders-controls";

async function getMaterialOrders() {
  const orders = await prisma.materialOrder.findMany({
    include: {
      orderItems: {
        include: {
          material: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return orders;
}

export default async function MaterialOrdersPage() {
  const initialOrders = await getMaterialOrders();

  return (
    <div className="space-y-4">
      <MaterialOrdersControls initialOrders={initialOrders} />
    </div>
  );
}
```

# app/(routes)/operations/page.tsx

```tsx
// app/operations/page.tsx
import Link from "next/link";

export default function OperationsPage() {
  const operations = [
    {
      title: "Material Order",
      description: "Track and manage material orders and their status",
      href: "/operations/material-orders",
      icon: "📦", // We can replace this with a proper icon
      stats: {
        active: 5, // These could be real numbers from your DB
        pending: 2,
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Operations</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {operations.map((operation) => (
          <Link
            key={operation.title}
            href={operation.href}
            className="block p-6 bg-white rounded-lg border hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{operation.icon}</div>
              <div>
                <h3 className="text-lg font-semibold">{operation.title}</h3>
                <p className="text-sm text-gray-500">{operation.description}</p>
              </div>
            </div>

            {operation.stats && (
              <div className="mt-4 flex space-x-4">
                <div className="text-sm">
                  <span className="font-medium text-green-600">
                    {operation.stats.active}
                  </span>
                  <span className="text-gray-500"> active</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-yellow-600">
                    {operation.stats.pending}
                  </span>
                  <span className="text-gray-500"> pending</span>
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

```

# app/api/contacts/[contactId]/route.ts

```ts
// app/api/contacts/[contactId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { contactId: string } }
) {
  try {
    const contactId = params.contactId;

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

export async function PATCH(
  request: Request,
  { params }: { params: { contactId: string } }
) {
  try {
    const json = await request.json();
    const contactId = params.contactId;

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

export async function DELETE(
  _request: Request,
  { params }: { params: { contactId: string } }
) {
  try {
    const contactId = params.contactId;

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

```

# app/api/contacts/route.ts

```ts
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

```

# app/api/debug/contacts/route.ts

```ts
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

```

# app/api/material-orders/[orderId]/route.ts

```ts
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

```

# app/api/material-orders/route.ts

```ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const orders = await prisma.materialOrder.findMany({
      include: {
        orderItems: {
          include: {
            material: true,
          },
        },
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error fetching orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();

    // Validate required fields
    const requiredFields = [
      "orderNumber",
      "supplier",
      "totalPrice",
      "currency",
      "orderDate",
      "expectedDelivery",
      "status",
    ];

    for (const field of requiredFields) {
      if (json[field] === undefined || json[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const order = await prisma.materialOrder.create({
      data: {
        orderNumber: json.orderNumber,
        supplier: json.supplier,
        totalPrice: parseFloat(json.totalPrice),
        currency: json.currency,
        orderDate: new Date(json.orderDate),
        expectedDelivery: new Date(json.expectedDelivery),
        actualDelivery: json.actualDelivery ? new Date(json.actualDelivery) : null,
        status: json.status,
        notes: json.notes || null,
      },
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
      { error: "Error creating order" },
      { status: 500 }
    );
  }
}
```

# app/api/materials/[materialId]/route.ts

```ts
// app/api/materials/[materialId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { materialId: string } }
) {
  try {
    const materialId = params.materialId;

    const material = await prisma.material.findUnique({
      where: {
        id: materialId,
      },
      include: {
        inventory: {
          include: {
            movements: true,
          },
        },
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error("Error fetching material:", error);
    return NextResponse.json(
      { error: "Error fetching material" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { materialId: string } }
) {
  try {
    const json = await request.json();
    const materialId = params.materialId;

    // Ensure the material exists first
    const existingMaterial = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Update material using transaction to ensure data consistency
    const updatedMaterial = await prisma.$transaction(async (tx) => {
      const material = await tx.material.update({
        where: { id: materialId },
        data: {
          // Spread the json but explicitly remove relations to prevent unintended updates
          ...json,
          inventory: undefined,
          products: undefined,
          // Convert string values to numbers where needed
          defaultCostPerUnit: json.defaultCostPerUnit
            ? parseFloat(json.defaultCostPerUnit)
            : undefined,
        },
        include: {
          inventory: {
            include: {
              movements: true,
            },
          },
          products: {
            include: {
              product: true,
            },
          },
        },
      });

      return material;
    });

    return NextResponse.json(updatedMaterial);
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      {
        error: "Error updating material",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { materialId: string } }
) {
  try {
    const materialId = params.materialId;

    console.log("Attempting to delete material:", materialId);

    // Check if material exists with all relevant relations
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        inventory: {
          include: {
            movements: true,
          },
        },
        products: true,
      },
    });

    if (!material) {
      console.log("Material not found:", materialId);
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Check if material has any inventory or product relationships
    if (material.inventory.length > 0 || material.products.length > 0) {
      // Check if any inventory has movements
      const hasMovements = material.inventory.some(
        (inv) => inv.movements.length > 0
      );

      if (hasMovements) {
        return NextResponse.json(
          { error: "Cannot delete material with existing inventory movements" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error:
            "Cannot delete material that is in use by products or has existing inventory",
        },
        { status: 400 }
      );
    }

    // Use transaction to ensure all related records are deleted properly
    await prisma.$transaction(async (tx) => {
      // Delete all inventory records
      await tx.inventory.deleteMany({
        where: {
          materialId: materialId,
        },
      });

      // Delete all product-material relationships
      await tx.productMaterial.deleteMany({
        where: {
          materialId: materialId,
        },
      });

      // Finally delete the material
      await tx.material.delete({
        where: {
          id: materialId,
        },
      });
    });

    console.log("Material and related records deleted successfully");
    return NextResponse.json({
      message: "Material deleted successfully",
      id: materialId,
    });
  } catch (error) {
    console.error("Error during material deletion:", error);
    return NextResponse.json(
      {
        error: "Error deleting material",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

```

# app/api/materials/route.ts

```ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      include: {
        inventory: true,
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error fetching materials" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();

    // Basic validation
    const requiredFields = [
      "type", 
      "color", 
      "colorCode", 
      "brand", 
      "defaultUnit", 
      "defaultCostPerUnit",
      "currency"
    ];
    for (const field of requiredFields) {
      if (!json[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create material with potential relationships
    const material = await prisma.$transaction(async (tx) => {
      // Create the base material
      const newMaterial = await tx.material.create({
        data: {
          type: json.type,
          color: json.color,
          colorCode: json.colorCode,
          brand: json.brand,
          defaultUnit: json.defaultUnit,
          defaultCostPerUnit: parseFloat(json.defaultCostPerUnit),
          currency: json.currency,
          notes: json.notes || null,
        },
      });

      // Create inventory if provided
      if (json.inventory?.length) {
        await tx.inventory.createMany({
          data: json.inventory.map((inv: any) => ({
            type: "MATERIAL",
            materialId: newMaterial.id,
            quantity: inv.quantity,
            unit: inv.unit,
            location: inv.location,
            notes: inv.notes,
          })),
        });
      }

      return newMaterial;
    });

    // Fetch complete material with relations
    const materialWithRelations = await prisma.material.findUnique({
      where: { id: material.id },
      include: {
        inventory: true,
        products: {
          include: {
            material: true,
          },
        },
      },
    });

    return NextResponse.json(materialWithRelations);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error creating material" },
      { status: 500 }
    );
  }
}
```

# app/api/products/[productId]/route.ts

```ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        materials: {
          include: {
            material: true,
          },
        },
        inventory: {
          include: {
            movements: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Error fetching product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const json = await request.json();
    const productId = params.productId;

    // Ensure the product exists first
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update product using transaction to ensure data consistency
    const updatedProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          // Spread the json but explicitly remove relations to prevent unintended updates
          ...json,
          materials: undefined,
          inventory: undefined,
        },
        include: {
          materials: {
            include: {
              material: true,
            },
          },
          inventory: {
            include: {
              movements: true,
            },
          },
        },
      });

      return product;
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { 
        error: "Error updating product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;

    console.log("Attempting to delete product:", productId);

    // Check if product exists with all relevant relations
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        materials: true,
        inventory: {
          include: {
            movements: true,
          },
        },
      },
    });

    if (!product) {
      console.log("Product not found:", productId);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product has any inventory
    if (product.inventory.length > 0) {
      // Check if any inventory has movements
      const hasMovements = product.inventory.some(inv => inv.movements.length > 0);
      
      if (hasMovements) {
        return NextResponse.json(
          { error: "Cannot delete product with existing inventory movements" },
          { status: 400 }
        );
      }

      // If inventory exists but no movements, we can proceed but should warn
      console.warn("Deleting product with existing inventory but no movements:", productId);
    }

    // Use transaction to ensure all related records are deleted properly
    await prisma.$transaction(async (tx) => {
      // Delete all inventory movements first (if any exist)
      if (product.inventory.length > 0) {
        await tx.transactionItem.deleteMany({
          where: {
            inventory: {
              productId: productId,
            },
          },
        });
      }

      // Delete all inventory records
      await tx.inventory.deleteMany({
        where: {
          productId: productId,
        },
      });

      // Delete all product-material relationships
      await tx.productMaterial.deleteMany({
        where: {
          productId: productId,
        },
      });

      // Finally delete the product
      await tx.product.delete({
        where: {
          id: productId,
        },
      });
    });

    console.log("Product and related records deleted successfully");
    return NextResponse.json({
      message: "Product deleted successfully",
      id: productId,
    });
  } catch (error) {
    console.error("Error during product deletion:", error);
    return NextResponse.json(
      {
        error: "Error deleting product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

# app/api/products/route.ts

```ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventory: true,
        materials: {
          include: {
            material: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error fetching products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();

    // Basic validation
    const requiredFields = ["sku", "piece", "name", "season", "phase"];
    for (const field of requiredFields) {
      if (!json[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create product with potential relationships
    const product = await prisma.$transaction(async (tx) => {
      // Create the base product
      const newProduct = await tx.product.create({
        data: {
          sku: json.sku,
          piece: json.piece,
          name: json.name,
          season: json.season,
          phase: json.phase,
          notes: json.notes || null,
          photos: json.photos || [],
        },
      });

      // Create inventory if provided
      if (json.inventory?.length) {
        await tx.inventory.createMany({
          data: json.inventory.map((inv: any) => ({
            type: "PRODUCT",
            productId: newProduct.id,
            quantity: inv.quantity,
            unit: inv.unit,
            location: inv.location,
          })),
        });
      }

      // Create material associations if provided
      if (json.materials?.length) {
        await tx.productMaterial.createMany({
          data: json.materials.map((mat: any) => ({
            productId: newProduct.id,
            materialId: mat.materialId,
            quantity: mat.quantity,
            unit: mat.unit,
          })),
        });
      }

      return newProduct;
    });

    // Fetch complete product with relations
    const productWithRelations = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        inventory: true,
        materials: {
          include: {
            material: true,
          },
        },
      },
    });

    return NextResponse.json(productWithRelations);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error creating product" },
      { status: 500 }
    );
  }
}

```

# app/api/styles/route.ts

```ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const styles = await prisma.style.findMany({
      include: {
        materials: {
          include: {
            material: true,
          },
        },
      },
    });
    return NextResponse.json(styles);
  } catch (error: unknown) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const style = await prisma.style.create({
      data: {
        piece: json.piece,
        name: json.name,
        season: json.season,
        phase: json.phase,
        photos: json.photos || [],
        notes: json.notes,
      },
      include: {
        materials: true,
      },
    });
    return NextResponse.json(style);
  } catch (error: unknown) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

```

# app/components/data-tables/data-table.tsx

```tsx
// app/components/data-tables/data-table.tsx
"use client";

import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { useRouter } from "next/navigation";

export type DataTableColumn<T> = {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
};

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  onDelete?: (id: string) => void;
  onUpdate?: (item: T) => void;
  viewPath: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onDelete,
  onUpdate,
  viewPath,
}: DataTableProps<T>) {
  const router = useRouter();

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            {columns.map((column) => (
              <th
                key={String(column.accessorKey)}
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
          {data.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={`${item.id}-${String(column.accessorKey)}`}
                  className="px-4 py-2 text-sm"
                >
                  {column.cell
                    ? column.cell(item)
                    : String(
                        (item[column.accessorKey as keyof T] as string) || "-"
                      )}
                </td>
              ))}
              <td className="px-4 py-2 text-sm">
                <DataTableRowActions
                  onView={() => router.push(`${viewPath}/${item.id}`)}
                  onEdit={onUpdate ? () => onUpdate(item) : undefined}
                  onDelete={onDelete ? () => onDelete(item.id) : undefined}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

```

# app/components/data-tables/materials-orders-table.tsx

```tsx
"use client";

import { MaterialOrderEditForm } from "@/components/forms/material-order-edit-form";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { DialogComponent } from "@/components/ui/dialog";
import { MaterialOrder, OrderStatus } from "@/types/materialOrder";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Column {
  header: string;
  accessorKey: string;
  cell?: (item: MaterialOrder) => React.ReactNode;
}

const columns: Column[] = [
  {
    header: "Order Number",
    accessorKey: "orderNumber",
  },
  {
    header: "Supplier",
    accessorKey: "supplier",
  },
  {
    header: "Total Price",
    accessorKey: "totalPrice",
    cell: (order) => `${order.totalPrice} ${order.currency}`,
  },
  {
    header: "Order Date",
    accessorKey: "orderDate",
    cell: (order) => new Date(order.orderDate).toLocaleDateString(),
  },
  {
    header: "Expected Delivery",
    accessorKey: "expectedDelivery",
    cell: (order) => new Date(order.expectedDelivery).toLocaleDateString(),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: (order) => (
      <span
        className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
          order.status
        )}`}
      >
        {order.status}
      </span>
    ),
  },
];

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case OrderStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    case OrderStatus.CONFIRMED:
      return "bg-blue-100 text-blue-800";
    case OrderStatus.SHIPPED:
      return "bg-purple-100 text-purple-800";
    case OrderStatus.DELIVERED:
      return "bg-green-100 text-green-800";
    case OrderStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

interface MaterialOrdersTableProps {
  orders: MaterialOrder[];
  onUpdate: (order: MaterialOrder) => void;
  onDelete: (orderId: string) => void;
}

export function MaterialOrdersTable({
  orders,
  onUpdate,
  onDelete,
}: MaterialOrdersTableProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MaterialOrder | null>(
    null
  );

  const handleEdit = (order: MaterialOrder) => {
    setSelectedOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleSaveSuccess = async (updatedOrder: MaterialOrder) => {
    try {
      const response = await fetch(
        `/api/material-orders/${selectedOrder?.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedOrder),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      const updated = await response.json();
      onUpdate(updated);
      setIsEditDialogOpen(false);
      setSelectedOrder(null);
      router.refresh();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  return (
    <>
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
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={`${order.id}-${column.accessorKey}`}
                    className="px-4 py-2 text-sm"
                  >
                    {column.cell
                      ? column.cell(order)
                      : String(
                          order[column.accessorKey as keyof MaterialOrder]
                        )}
                  </td>
                ))}
                <td className="px-4 py-2 text-sm">
                  <DataTableRowActions
                    onView={() =>
                      router.push(`/operations/material-orders/${order.id}`)
                    }
                    onEdit={() => handleEdit(order)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <DialogComponent
          open={isEditDialogOpen}
          onOpenChange={(open: boolean) => {
            setIsEditDialogOpen(open);
            if (!open) setSelectedOrder(null);
          }}
          title="Edit Order"
        >
          <MaterialOrderEditForm
            order={selectedOrder}
            onSaveSuccess={handleSaveSuccess}
            onDeleteSuccess={onDelete}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedOrder(null);
            }}
          />
        </DialogComponent>
      )}
    </>
  );
}

```

# app/components/forms/add-material-dialog.tsx

```tsx
import { MaterialEditForm } from "@/components/forms/material-edit-form";
import { DialogComponent } from "@/components/ui/dialog";
import { Material } from "@/types/material";
import { MeasurementUnit } from ".prisma/client";

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (material: Material) => void;
}

const defaultMaterial: Omit<Material, "id" | "createdAt" | "updatedAt"> = {
  type: "",
  color: "",
  colorCode: "",
  brand: "",
  quantity: 0,
  unit: MeasurementUnit.KILOGRAM,
  costPerUnit: 0,
  currency: "USD",
  location: "",
  notes: "",
  photos: [],
};

export function AddMaterialDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddMaterialDialogProps) {
  const handleSave = async (materialData: Partial<Material>) => {
    try {
      const response = await fetch("/api/materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create material");
      }

      const newMaterial = await response.json();
      onSuccess(newMaterial);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating material:", error);
      throw error;
    }
  };

  return (
    <DialogComponent
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Material"
    >
      <MaterialEditForm
        material={defaultMaterial as Material} // Type assertion since we omit id/dates
        onSaveSuccess={handleSave}
        onCancel={() => onOpenChange(false)}
        mode="create"
      />
    </DialogComponent>
  );
}

```

# app/components/forms/add-material-order-dialog.tsx

```tsx
"use client";

import { MaterialOrderEditForm } from "@/components/forms/material-order-edit-form";
import { DialogComponent } from "@/components/ui/dialog";
import { MaterialOrder, OrderStatus } from "@/types/materialOrder";
import { useRouter } from "next/navigation";

interface AddMaterialOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (order: MaterialOrder) => void;
}

const defaultOrder: Omit<MaterialOrder, "id" | "createdAt" | "updatedAt"> = {
  orderNumber: "",
  supplier: "",
  orderItems: [],
  totalPrice: 0,
  currency: "USD",
  orderDate: new Date(),
  expectedDelivery: new Date(),
  actualDelivery: undefined,
  status: OrderStatus.PENDING,
  notes: "",
};

export function AddMaterialOrderDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddMaterialOrderDialogProps) {
  const router = useRouter();

  const handleSave = async (orderData: Partial<MaterialOrder>) => {
    try {
      const response = await fetch("/api/material-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create order");
      }

      const newOrder = await response.json();
      onSuccess(newOrder);
      onOpenChange(false);
      router.refresh(); // Refresh server-side data
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  return (
    <DialogComponent
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Material Order"
    >
      <MaterialOrderEditForm
        order={defaultOrder as MaterialOrder}
        onSaveSuccess={handleSave}
        onCancel={() => onOpenChange(false)}
        mode="create"
      />
    </DialogComponent>
  );
}

```

# app/components/forms/add-product-dialog.tsx

```tsx
import { ProductEditForm } from "@/components/forms/product-edit-form";
import { DialogComponent } from "@/components/ui/dialog";
import { Product } from "@/types/product";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (product: Product) => void;
}

const defaultProduct: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
  sku: "",
  piece: "",
  name: "",
  season: "",
  phase: "SWATCH",
  notes: "",
  photos: [],
};

export function AddProductDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddProductDialogProps) {
  const handleSave = async (productData: Partial<Product>) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create product");
      }

      const newProduct = await response.json();
      onSuccess(newProduct);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  };

  return (
    <DialogComponent
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Product"
    >
      <ProductEditForm
        product={defaultProduct as Product}
        onSaveSuccess={handleSave}
        onCancel={() => onOpenChange(false)}
        mode="create"
      />
    </DialogComponent>
  );
}

```

# app/components/forms/edit-form.tsx

```tsx
"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";

interface EditFormProps<T> {
  mode?: "edit" | "create";
  initialData: T;
  fields: FormField<T>[];
  onSaveSuccess: (updatedData: T) => void;
  onDeleteSuccess?: (id: string) => Promise<void>;
  onCancel: () => void;
}

interface FormField<T> {
  key: keyof T;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  options?: string[];
  required?: boolean;
}

export function EditForm<T extends { id: string }>({
  mode = "edit",
  initialData,
  fields,
  onSaveSuccess,
  onDeleteSuccess,
  onCancel,
}: EditFormProps<T>) {
  const [formData, setFormData] = useState(initialData);
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      onSaveSuccess(formData);
      showToast(
        `Item ${mode === "create" ? "created" : "updated"} successfully`,
        "success"
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to save item",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteSuccess) return;
    setIsDeleting(true);
    try {
      await onDeleteSuccess(formData.id);
      showToast("Item deleted successfully", "success");
      onCancel();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to delete item",
        "error"
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={String(field.key)} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  value={formData[field.key]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required={field.required}
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  value={formData[field.key]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                  required={field.required}
                />
              ) : (
                <input
                  type={field.type}
                  value={formData[field.key]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between border-t pt-6 mt-6">
          {mode === "edit" && onDeleteSuccess && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
            >
              Delete Item
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                ? "Create Item"
                : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {mode === "edit" && onDeleteSuccess && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Item"
          description="Are you sure you want to delete this item? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}

```

# app/components/forms/material-edit-form.tsx

```tsx
"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Material, MeasurementUnit } from "@/types/types";
import { useState } from "react";

interface MaterialEditFormProps {
  material: Material;
  onSaveSuccess: (updatedMaterial: Material) => void;
  onDeleteSuccess?: (materialId: string) => Promise<void>; // Update type
  onCancel: () => void;
  mode?: "edit" | "create";
}

export function MaterialEditForm({
  material,
  onSaveSuccess,
  onDeleteSuccess,
  onCancel,
  mode = "edit",
}: MaterialEditFormProps) {
  const [formData, setFormData] = useState({
    type: material.type,
    color: material.color,
    colorCode: material.colorCode,
    brand: material.brand,
    quantity: material.quantity,
    unit: material.unit,
    costPerUnit: material.costPerUnit,
    currency: material.currency,
    location: material.location,
    notes: material.notes || "",
  });

  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      onSaveSuccess(formData as Material);
      showToast(
        `Material ${mode === "create" ? "created" : "updated"} successfully`,
        "success"
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to save material",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteSuccess) return;
    setIsDeleting(true);
    try {
      await onDeleteSuccess(material.id);
      showToast("Material deleted successfully", "success");
      onCancel();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to delete material",
        "error"
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Type</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Brand</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, brand: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Color</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, color: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Color Code
            </label>
            <input
              type="text"
              value={formData.colorCode}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, colorCode: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  quantity: parseFloat(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Unit</label>
            <select
              value={formData.unit}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  unit: e.target.value as MeasurementUnit,
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              {Object.values(MeasurementUnit).map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Cost Per Unit
            </label>
            <input
              type="number"
              value={formData.costPerUnit}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  costPerUnit: parseFloat(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Currency
            </label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, currency: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            rows={3}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="flex justify-between border-t pt-6 mt-6">
          {mode === "edit" && onDeleteSuccess && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
            >
              Delete Material
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                ? "Create Material"
                : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {mode === "edit" && onDeleteSuccess && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Material"
          description="Are you sure you want to delete this material? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}

```

# app/components/forms/material-order-edit-form.tsx

```tsx
"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Material } from "@/types/material";
import {
  MaterialOrder,
  MeasurementUnit,
  OrderStatus,
} from "@/types/materialOrder";
import { useEffect, useMemo, useState } from "react";

interface MaterialOrderEditFormProps {
  order: MaterialOrder;
  onSaveSuccess: (updatedOrder: MaterialOrder) => void;
  onDeleteSuccess?: (orderId: string) => Promise<void>;
  onCancel: () => void;
  mode?: "edit" | "create";
}

interface OrderItemFormData {
  materialId: string;
  quantity: number;
  unit: MeasurementUnit;
  unitPrice: number;
}

// Helper function to safely format dates
const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d instanceof Date && !isNaN(d.getTime())
    ? d.toISOString().split("T")[0]
    : "";
};

export function MaterialOrderEditForm({
  order,
  onSaveSuccess,
  onDeleteSuccess,
  onCancel,
  mode = "edit",
}: MaterialOrderEditFormProps) {
  const [formData, setFormData] = useState({
    orderNumber: order.orderNumber,
    supplier: order.supplier,
    status: order.status,
    totalPrice: order.totalPrice,
    currency: order.currency,
    orderDate: formatDate(order.orderDate),
    expectedDelivery: formatDate(order.expectedDelivery),
    actualDelivery: formatDate(order.actualDelivery),
    notes: order.notes || "",
  });

  const [orderItems, setOrderItems] = useState<OrderItemFormData[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);

  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch available materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch("/api/materials");
        const materials = await response.json();
        setAvailableMaterials(materials);
      } catch (error) {
        console.error("Error fetching materials:", error);
        showToast("Failed to load materials", "error");
      }
    };

    fetchMaterials();
  }, []);

  // New state for stepped selection
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [quantity, setQuantity] = useState<number>(0);

  // Computed values based on available materials
  const availableBrands = useMemo(() => {
    const brands = new Set(availableMaterials.map((m) => m.brand));
    return Array.from(brands).sort();
  }, [availableMaterials]);

  const availableTypes = useMemo(() => {
    if (!selectedBrand) return [];
    const types = new Set(
      availableMaterials
        .filter((m) => m.brand === selectedBrand)
        .map((m) => m.type)
    );
    return Array.from(types).sort();
  }, [selectedBrand, availableMaterials]);

  const availableColors = useMemo(() => {
    if (!selectedBrand || !selectedType) return [];
    return availableMaterials
      .filter((m) => m.brand === selectedBrand && m.type === selectedType)
      .map((m) => ({
        id: m.id,
        color: m.color,
        colorCode: m.colorCode,
        costPerUnit: m.costPerUnit,
        unit: m.unit,
      }))
      .sort((a, b) => a.color.localeCompare(b.color));
  }, [selectedBrand, selectedType, availableMaterials]);

  const selectedMaterial = useMemo(
    () => availableMaterials.find((m) => m.id === selectedMaterialId),
    [selectedMaterialId, availableMaterials]
  );

  // Reset dependent fields when parent selection changes
  useEffect(() => {
    setSelectedType("");
    setSelectedMaterialId("");
    setQuantity(0);
  }, [selectedBrand]);

  useEffect(() => {
    setSelectedMaterialId("");
    setQuantity(0);
  }, [selectedType]);

  useEffect(() => {
    setQuantity(0);
  }, [selectedMaterialId]);

  const handleAddOrderItem = () => {
    if (!selectedMaterial || quantity <= 0) {
      showToast("Please complete all fields", "error");
      return;
    }

    const newOrderItem: OrderItemFormData = {
      materialId: selectedMaterial.id,
      quantity: quantity,
      unit: selectedMaterial.unit,
      unitPrice: selectedMaterial.costPerUnit,
    };

    setOrderItems([...orderItems, newOrderItem]);

    // Update total price
    const itemTotal = quantity * selectedMaterial.costPerUnit;
    setFormData((prev) => ({
      ...prev,
      totalPrice: prev.totalPrice + itemTotal,
    }));

    // Reset selection
    setSelectedBrand("");
    setSelectedType("");
    setSelectedMaterialId("");
    setQuantity(0);
  };

  const handleRemoveOrderItem = (index: number) => {
    const removedItem = orderItems[index];
    const itemTotal = removedItem.quantity * removedItem.unitPrice;

    setOrderItems(orderItems.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      totalPrice: prev.totalPrice - itemTotal,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (orderItems.length === 0) {
        throw new Error("Please add at least one material to the order");
      }

      const processedData = {
        ...formData,
        totalPrice: parseFloat(formData.totalPrice.toString()),
        orderDate: new Date(formData.orderDate),
        expectedDelivery: new Date(formData.expectedDelivery),
        actualDelivery: formData.actualDelivery
          ? new Date(formData.actualDelivery)
          : null,
        orderItems: orderItems.map((item) => ({
          ...item,
          totalPrice: item.quantity * item.unitPrice,
        })),
      };

      onSaveSuccess(processedData as MaterialOrder);
      showToast(
        `Order ${mode === "create" ? "created" : "updated"} successfully`,
        "success"
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to save order",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteSuccess) return;
    setIsDeleting(true);
    try {
      await onDeleteSuccess(order.id);
      showToast("Order deleted successfully", "success");
      onCancel();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to delete order",
        "error"
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Existing form fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Order Number
            </label>
            <input
              type="text"
              value={formData.orderNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  orderNumber: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Supplier
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, supplier: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as OrderStatus,
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              {Object.values(OrderStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Total Price
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                value={formData.totalPrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalPrice: parseFloat(e.target.value),
                  }))
                }
                className="flex-1 px-3 py-2 border rounded-md"
                required
              />
              <input
                type="text"
                value={formData.currency}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, currency: e.target.value }))
                }
                className="w-20 px-3 py-2 border rounded-md"
                placeholder="USD"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Order Date
            </label>
            <input
              type="date"
              value={formData.orderDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, orderDate: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Expected Delivery
            </label>
            <input
              type="date"
              value={formData.expectedDelivery}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expectedDelivery: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Actual Delivery
            </label>
            <input
              type="date"
              value={formData.actualDelivery}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  actualDelivery: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        {/* Order Items Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>

          {/* Stepped material selection form */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {/* Brand Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Brand</option>
                {availableBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={!selectedBrand}
              >
                <option value="">Select Type</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Color</label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={!selectedType}
              >
                <option value="">Select Color</option>
                {availableColors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.color} ({color.colorCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Quantity
              </label>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        e.target.value === "" ? 0 : parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    min="0"
                    step="0.01"
                    disabled={!selectedMaterialId}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddOrderItem}
                  disabled={!selectedMaterialId || quantity <= 0}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Display unit price if material is selected */}
          {selectedMaterial && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                Price: {selectedMaterial.costPerUnit} {formData.currency} per{" "}
                {selectedMaterial.unit}
                {quantity > 0 && (
                  <span className="ml-2">
                    | Total:{" "}
                    {(quantity * selectedMaterial.costPerUnit).toFixed(2)}{" "}
                    {formData.currency}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Order items list */}
          {orderItems.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Material
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Unit Price
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Total
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => {
                    const material = availableMaterials.find(
                      (m) => m.id === item.materialId
                    );
                    return (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">
                          {material && (
                            <>
                              <div>
                                {material.brand} - {material.type}
                              </div>
                              <div className="text-sm text-gray-500">
                                {material.color} ({material.colorCode})
                              </div>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-4 py-2">
                          {item.unitPrice} {formData.currency}
                        </td>
                        <td className="px-4 py-2">
                          {(item.quantity * item.unitPrice).toFixed(2)}{" "}
                          {formData.currency}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveOrderItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-between border-t pt-6">
          {mode === "edit" && onDeleteSuccess && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
            >
              Delete Order
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || orderItems.length === 0}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                ? "Create Order"
                : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {mode === "edit" && onDeleteSuccess && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Order"
          description="Are you sure you want to delete this order? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}

// "use client";

// import { ConfirmDialog } from "@/components/ui/confirm-dialog";
// import { useToast } from "@/components/ui/toast";
// import { Material } from "@/types/material";
// import { MaterialOrder, MaterialOrderItem, MeasurementUnit, OrderStatus } from "@/types/materialOrder";
// import { useState, useEffect, useMemo } from "react";

// interface MaterialOrderEditFormProps {
//   order: MaterialOrder;
//   onSaveSuccess: (updatedOrder: MaterialOrder) => void;
//   onDeleteSuccess?: (orderId: string) => Promise<void>;
//   onCancel: () => void;
//   mode?: "edit" | "create";
// }

// interface OrderItemFormData {
//   materialId: string;
//   quantity: number;
//   unit: MeasurementUnit;
//   unitPrice: number;
// }

// // Helper function to safely format dates
// const formatDate = (date: Date | string | null | undefined) => {
//   if (!date) return "";
//   const d = typeof date === "string" ? new Date(date) : date;
//   return d instanceof Date && !isNaN(d.getTime())
//     ? d.toISOString().split("T")[0]
//     : "";
// };

// export function MaterialOrderEditForm({
//   order,
//   onSaveSuccess,
//   onDeleteSuccess,
//   onCancel,
//   mode = "edit",
// }: MaterialOrderEditFormProps) {
//   const [formData, setFormData] = useState({
//     orderNumber: order.orderNumber,
//     supplier: order.supplier,
//     status: order.status,
//     totalPrice: order.totalPrice,
//     currency: order.currency,
//     orderDate: formatDate(order.orderDate),
//     expectedDelivery: formatDate(order.expectedDelivery),
//     actualDelivery: formatDate(order.actualDelivery),
//     notes: order.notes || "",
//   });

//   const [orderItems, setOrderItems] = useState<OrderItemFormData[]>([]);
//   const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
//   const [newItem, setNewItem] = useState<OrderItemFormData>({
//     materialId: "",
//     quantity: 0,
//     unit: MeasurementUnit.KILOGRAM,
//     unitPrice: 0,
//   });

//   const { showToast } = useToast();
//   const [isSaving, setIsSaving] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

//   const handleAddOrderItem = () => {
//     if (
//       !newItem.materialId ||
//       newItem.quantity <= 0 ||
//       newItem.unitPrice <= 0
//     ) {
//       showToast("Please fill in all order item fields", "error");
//       return;
//     }

//     setOrderItems([...orderItems, newItem]);
//     setNewItem({
//       materialId: "",
//       quantity: 0,
//       unit: MeasurementUnit.KILOGRAM,
//       unitPrice: 0,
//     });

//     // Update total price
//     const itemTotal = newItem.quantity * newItem.unitPrice;
//     setFormData((prev) => ({
//       ...prev,
//       totalPrice: prev.totalPrice + itemTotal,
//     }));
//   };

//   const handleRemoveOrderItem = (index: number) => {
//     const removedItem = orderItems[index];
//     const itemTotal = removedItem.quantity * removedItem.unitPrice;

//     setOrderItems(orderItems.filter((_, i) => i !== index));
//     setFormData((prev) => ({
//       ...prev,
//       totalPrice: prev.totalPrice - itemTotal,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSaving(true);

//     try {
//       if (orderItems.length === 0) {
//         throw new Error("Please add at least one material to the order");
//       }

//       const processedData = {
//         ...formData,
//         totalPrice: parseFloat(formData.totalPrice.toString()),
//         orderDate: new Date(formData.orderDate),
//         expectedDelivery: new Date(formData.expectedDelivery),
//         actualDelivery: formData.actualDelivery
//           ? new Date(formData.actualDelivery)
//           : null,
//         orderItems: orderItems.map((item) => ({
//           ...item,
//           totalPrice: item.quantity * item.unitPrice,
//         })),
//       };

//       onSaveSuccess(processedData as MaterialOrder);
//       showToast(
//         `Order ${mode === "create" ? "created" : "updated"} successfully`,
//         "success"
//       );
//     } catch (error) {
//       showToast(
//         error instanceof Error ? error.message : "Failed to save order",
//         "error"
//       );
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!onDeleteSuccess) return;
//     setIsDeleting(true);
//     try {
//       await onDeleteSuccess(order.id);
//       showToast("Order deleted successfully", "success");
//       onCancel();
//     } catch (error) {
//       showToast(
//         error instanceof Error ? error.message : "Failed to delete order",
//         "error"
//       );
//     } finally {
//       setIsDeleting(false);
//       setShowDeleteConfirm(false);
//     }
//   };

//   return (
//     <>
//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Existing form fields */}
//         <div className="grid grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-700">
//               Order Number
//             </label>
//             <input
//               type="text"
//               value={formData.orderNumber}
//               onChange={(e) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   orderNumber: e.target.value,
//                 }))
//               }
//               className="w-full px-3 py-2 border rounded-md"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-700">
//               Supplier
//             </label>
//             <input
//               type="text"
//               value={formData.supplier}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, supplier: e.target.value }))
//               }
//               className="w-full px-3 py-2 border rounded-md"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-700">Status</label>
//             <select
//               value={formData.status}
//               onChange={(e) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   status: e.target.value as OrderStatus,
//                 }))
//               }
//               className="w-full px-3 py-2 border rounded-md"
//               required
//             >
//               {Object.values(OrderStatus).map((status) => (
//                 <option key={status} value={status}>
//                   {status}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-700">
//               Total Price
//             </label>
//             <div className="flex gap-2">
//               <input
//                 type="number"
//                 step="0.01"
//                 value={formData.totalPrice}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     totalPrice: parseFloat(e.target.value),
//                   }))
//                 }
//                 className="flex-1 px-3 py-2 border rounded-md"
//                 required
//               />
//               <input
//                 type="text"
//                 value={formData.currency}
//                 onChange={(e) =>
//                   setFormData((prev) => ({ ...prev, currency: e.target.value }))
//                 }
//                 className="w-20 px-3 py-2 border rounded-md"
//                 placeholder="USD"
//                 required
//               />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-700">
//               Order Date
//             </label>
//             <input
//               type="date"
//               value={formData.orderDate}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, orderDate: e.target.value }))
//               }
//               className="w-full px-3 py-2 border rounded-md"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-700">
//               Expected Delivery
//             </label>
//             <input
//               type="date"
//               value={formData.expectedDelivery}
//               onChange={(e) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   expectedDelivery: e.target.value,
//                 }))
//               }
//               className="w-full px-3 py-2 border rounded-md"
//               required
//             />
//           </div>

//           <div className="space-y-2 col-span-2">
//             <label className="text-sm font-medium text-gray-700">
//               Actual Delivery
//             </label>
//             <input
//               type="date"
//               value={formData.actualDelivery}
//               onChange={(e) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   actualDelivery: e.target.value,
//                 }))
//               }
//               className="w-full px-3 py-2 border rounded-md"
//             />
//           </div>

//           <div className="space-y-2 col-span-2">
//             <label className="text-sm font-medium text-gray-700">Notes</label>
//             <textarea
//               value={formData.notes}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, notes: e.target.value }))
//               }
//               rows={3}
//               className="w-full px-3 py-2 border rounded-md"
//             />
//           </div>
//         </div>

//         {/* Order Items Section */}
//         <div className="border-t pt-6">
//           <h3 className="text-lg font-semibold mb-4">Order Items</h3>

//           {/* Add new item form */}
//           <div className="grid grid-cols-4 gap-4 mb-4">
//             <div className="space-y-2">
//               <label className="text-sm font-medium text-gray-700">
//                 Material
//               </label>
//               <select
//                 value={newItem.materialId}
//                 onChange={(e) =>
//                   setNewItem((prev) => ({
//                     ...prev,
//                     materialId: e.target.value,
//                   }))
//                 }
//                 className="w-full px-3 py-2 border rounded-md"
//               >
//                 <option value="">Select Material</option>
//                 {availableMaterials.map((material) => (
//                   <option key={material.id} value={material.id}>
//                     {material.type} - {material.color}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-medium text-gray-700">
//                 Quantity
//               </label>
//               <input
//                 type="number"
//                 value={newItem.quantity}
//                 onChange={(e) =>
//                   setNewItem((prev) => ({
//                     ...prev,
//                     quantity: parseFloat(e.target.value),
//                   }))
//                 }
//                 className="w-full px-3 py-2 border rounded-md"
//                 min="0"
//                 step="0.01"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-medium text-gray-700">Unit</label>
//               <select
//                 value={newItem.unit}
//                 onChange={(e) =>
//                   setNewItem((prev) => ({
//                     ...prev,
//                     unit: e.target.value as MeasurementUnit,
//                   }))
//                 }
//                 className="w-full px-3 py-2 border rounded-md"
//               >
//                 {Object.values(MeasurementUnit).map((unit) => (
//                   <option key={unit} value={unit}>
//                     {unit}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-medium text-gray-700">
//                 Unit Price
//               </label>
//               <div className="flex gap-2">
//                 <input
//                   type="number"
//                   value={newItem.unitPrice}
//                   onChange={(e) =>
//                     setNewItem((prev) => ({
//                       ...prev,
//                       unitPrice: parseFloat(e.target.value),
//                     }))
//                   }
//                   className="w-full px-3 py-2 border rounded-md"
//                   min="0"
//                   step="0.01"
//                 />
//                 <button
//                   type="button"
//                   onClick={handleAddOrderItem}
//                   className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
//                 >
//                   Add
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Order items list */}
//           {orderItems.length > 0 && (
//             <div className="border rounded-md overflow-hidden">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
//                       Material
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
//                       Quantity
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
//                       Unit Price
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
//                       Total
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {orderItems.map((item, index) => {
//                     const material = availableMaterials.find(
//                       (m) => m.id === item.materialId
//                     );
//                     return (
//                       <tr key={index} className="border-t">
//                         <td className="px-4 py-2">
//                           {material
//                             ? `${material.type} - ${material.color}`
//                             : "Unknown"}
//                         </td>
//                         <td className="px-4 py-2">
//                           {item.quantity} {item.unit}
//                         </td>
//                         <td className="px-4 py-2">
//                           {item.unitPrice} {formData.currency}
//                         </td>
//                         <td className="px-4 py-2">
//                           {(item.quantity * item.unitPrice).toFixed(2)}{" "}
//                           {formData.currency}
//                         </td>
//                         <td className="px-4 py-2">
//                           <button
//                             type="button"
//                             onClick={() => handleRemoveOrderItem(index)}
//                             className="text-red-600 hover:text-red-800"
//                           >
//                             Remove
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Form Actions */}
//         <div className="flex justify-between border-t pt-6">
//           {mode === "edit" && onDeleteSuccess && (
//             <button
//               type="button"
//               onClick={() => setShowDeleteConfirm(true)}
//               className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
//             >
//               Delete Order
//             </button>
//           )}
//           <div className="flex gap-3 ml-auto">
//             <button
//               type="button"
//               onClick={onCancel}
//               className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isSaving || orderItems.length === 0}
//               className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
//             >
//               {isSaving
//                 ? mode === "create"
//                   ? "Creating..."
//                   : "Saving..."
//                 : mode === "create"
//                 ? "Create Order"
//                 : "Save Changes"}
//             </button>
//           </div>
//         </div>
//       </form>

//       {mode === "edit" && onDeleteSuccess && (
//         <ConfirmDialog
//           open={showDeleteConfirm}
//           onOpenChange={setShowDeleteConfirm}
//           title="Delete Order"
//           description="Are you sure you want to delete this order? This action cannot be undone."
//           onConfirm={handleDelete}
//           onCancel={() => setShowDeleteConfirm(false)}
//           isLoading={isDeleting}
//         />
//       )}
//     </>
//   );
// }

// // "use client";

// // import { ConfirmDialog } from "@/components/ui/confirm-dialog";
// // import { useToast } from "@/components/ui/toast";
// // import { MaterialOrder, OrderStatus } from "@/types/materialOrder";
// // import { useState } from "react";

// // interface MaterialOrderEditFormProps {
// //   order: MaterialOrder;
// //   onSaveSuccess: (updatedOrder: MaterialOrder) => void;
// //   onDeleteSuccess?: (orderId: string) => Promise<void>;
// //   onCancel: () => void;
// //   mode?: "edit" | "create";
// // }

// // // Helper function to safely format dates
// // const formatDate = (date: Date | string | null | undefined) => {
// //   if (!date) return "";
// //   const d = typeof date === "string" ? new Date(date) : date;
// //   return d instanceof Date && !isNaN(d.getTime())
// //     ? d.toISOString().split("T")[0]
// //     : "";
// // };

// // export function MaterialOrderEditForm({
// //   order,
// //   onSaveSuccess,
// //   onDeleteSuccess,
// //   onCancel,
// //   mode = "edit",
// // }: MaterialOrderEditFormProps) {

// //   const [formData, setFormData] = useState({
// //     orderNumber: order.orderNumber,
// //     supplier: order.supplier,
// //     status: order.status,
// //     totalPrice: order.totalPrice,
// //     currency: order.currency,
// //     orderDate: formatDate(order.orderDate),
// //     expectedDelivery: formatDate(order.expectedDelivery),
// //     actualDelivery: formatDate(order.actualDelivery),
// //     notes: order.notes || "",
// //   });

// //   const { showToast } = useToast();
// //   const [isSaving, setIsSaving] = useState(false);
// //   const [isDeleting, setIsDeleting] = useState(false);
// //   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setIsSaving(true);
// //     try {
// //       const processedData = {
// //         ...formData,
// //         totalPrice: parseFloat(formData.totalPrice.toString()),
// //         orderDate: new Date(formData.orderDate),
// //         expectedDelivery: new Date(formData.expectedDelivery),
// //         actualDelivery: formData.actualDelivery
// //           ? new Date(formData.actualDelivery)
// //           : null,
// //       };

// //       onSaveSuccess(processedData as MaterialOrder);
// //       showToast(
// //         `Order ${mode === "create" ? "created" : "updated"} successfully`,
// //         "success"
// //       );
// //     } catch (error) {
// //       showToast(
// //         error instanceof Error ? error.message : "Failed to save order",
// //         "error"
// //       );
// //     } finally {
// //       setIsSaving(false);
// //     }
// //   };

// //   const handleDelete = async () => {
// //     if (!onDeleteSuccess) return;
// //     setIsDeleting(true);
// //     try {
// //       await onDeleteSuccess(order.id);
// //       showToast("Order deleted successfully", "success");
// //       onCancel();
// //     } catch (error) {
// //       showToast(
// //         error instanceof Error ? error.message : "Failed to delete order",
// //         "error"
// //       );
// //     } finally {
// //       setIsDeleting(false);
// //       setShowDeleteConfirm(false);
// //     }
// //   };

// //   return (
// //     <>
// //       <form onSubmit={handleSubmit} className="space-y-4">
// //         <div className="grid grid-cols-2 gap-4">
// //           <div className="space-y-2">
// //             <label className="text-sm font-medium text-gray-700">
// //               Order Number
// //             </label>
// //             <input
// //               type="text"
// //               value={formData.orderNumber}
// //               onChange={(e) =>
// //                 setFormData((prev) => ({
// //                   ...prev,
// //                   orderNumber: e.target.value,
// //                 }))
// //               }
// //               className="w-full px-3 py-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div className="space-y-2">
// //             <label className="text-sm font-medium text-gray-700">
// //               Supplier
// //             </label>
// //             <input
// //               type="text"
// //               value={formData.supplier}
// //               onChange={(e) =>
// //                 setFormData((prev) => ({ ...prev, supplier: e.target.value }))
// //               }
// //               className="w-full px-3 py-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div className="space-y-2">
// //             <label className="text-sm font-medium text-gray-700">Status</label>
// //             <select
// //               value={formData.status}
// //               onChange={(e) =>
// //                 setFormData((prev) => ({
// //                   ...prev,
// //                   status: e.target.value as OrderStatus,
// //                 }))
// //               }
// //               className="w-full px-3 py-2 border rounded-md"
// //               required
// //             >
// //               {Object.values(OrderStatus).map((status) => (
// //                 <option key={status} value={status}>
// //                   {status}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>

// //           <div className="space-y-2">
// //             <label className="text-sm font-medium text-gray-700">
// //               Total Price
// //             </label>
// //             <div className="flex gap-2">
// //               <input
// //                 type="number"
// //                 step="0.01"
// //                 value={formData.totalPrice}
// //                 onChange={(e) =>
// //                   setFormData((prev) => ({
// //                     ...prev,
// //                     totalPrice: parseFloat(e.target.value),
// //                   }))
// //                 }
// //                 className="flex-1 px-3 py-2 border rounded-md"
// //                 required
// //               />
// //               <input
// //                 type="text"
// //                 value={formData.currency}
// //                 onChange={(e) =>
// //                   setFormData((prev) => ({ ...prev, currency: e.target.value }))
// //                 }
// //                 className="w-20 px-3 py-2 border rounded-md"
// //                 placeholder="USD"
// //                 required
// //               />
// //             </div>
// //           </div>

// //           <div className="space-y-2">
// //             <label className="text-sm font-medium text-gray-700">
// //               Order Date
// //             </label>
// //             <input
// //               type="date"
// //               value={formData.orderDate}
// //               onChange={(e) =>
// //                 setFormData((prev) => ({ ...prev, orderDate: e.target.value }))
// //               }
// //               className="w-full px-3 py-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div className="space-y-2">
// //             <label className="text-sm font-medium text-gray-700">
// //               Expected Delivery
// //             </label>
// //             <input
// //               type="date"
// //               value={formData.expectedDelivery}
// //               onChange={(e) =>
// //                 setFormData((prev) => ({
// //                   ...prev,
// //                   expectedDelivery: e.target.value,
// //                 }))
// //               }
// //               className="w-full px-3 py-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div className="space-y-2 col-span-2">
// //             <label className="text-sm font-medium text-gray-700">
// //               Actual Delivery
// //             </label>
// //             <input
// //               type="date"
// //               value={formData.actualDelivery}
// //               onChange={(e) =>
// //                 setFormData((prev) => ({
// //                   ...prev,
// //                   actualDelivery: e.target.value,
// //                 }))
// //               }
// //               className="w-full px-3 py-2 border rounded-md"
// //             />
// //           </div>

// //           <div className="space-y-2 col-span-2">
// //             <label className="text-sm font-medium text-gray-700">Notes</label>
// //             <textarea
// //               value={formData.notes}
// //               onChange={(e) =>
// //                 setFormData((prev) => ({ ...prev, notes: e.target.value }))
// //               }
// //               rows={3}
// //               className="w-full px-3 py-2 border rounded-md"
// //             />
// //           </div>
// //         </div>

// //         <div className="flex justify-between border-t pt-6 mt-6">
// //           {mode === "edit" && onDeleteSuccess && (
// //             <button
// //               type="button"
// //               onClick={() => setShowDeleteConfirm(true)}
// //               className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
// //             >
// //               Delete Order
// //             </button>
// //           )}
// //           <div className="flex gap-3 ml-auto">
// //             <button
// //               type="button"
// //               onClick={onCancel}
// //               className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
// //             >
// //               Cancel
// //             </button>
// //             <button
// //               type="submit"
// //               disabled={isSaving}
// //               className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
// //             >
// //               {isSaving
// //                 ? mode === "create"
// //                   ? "Creating..."
// //                   : "Saving..."
// //                 : mode === "create"
// //                 ? "Create Order"
// //                 : "Save Changes"}
// //             </button>
// //           </div>
// //         </div>
// //       </form>

// //       {mode === "edit" && onDeleteSuccess && (
// //         <ConfirmDialog
// //           open={showDeleteConfirm}
// //           onOpenChange={setShowDeleteConfirm}
// //           title="Delete Order"
// //           description="Are you sure you want to delete this order? This action cannot be undone."
// //           onConfirm={handleDelete}
// //           onCancel={() => setShowDeleteConfirm(false)}
// //           isLoading={isDeleting}
// //         />
// //       )}
// //     </>
// //   );
// // }

```

# app/components/forms/product-edit-form.tsx

```tsx
"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Product } from "@/types/product";
import { useState } from "react";

interface ProductEditFormProps {
  product: Product;
  onSaveSuccess: (updatedProduct: Product) => void;
  onDeleteSuccess?: (productId: string) => Promise<void>;
  onCancel: () => void;
  mode?: "edit" | "create";
}

export function ProductEditForm({
  product,
  onSaveSuccess,
  onDeleteSuccess,
  onCancel,
  mode = "edit",
}: ProductEditFormProps) {
  const [formData, setFormData] = useState({
    sku: product.sku,
    piece: product.piece,
    name: product.name,
    season: product.season,
    phase: product.phase,
    notes: product.notes || "",
    photos: product.photos,
  });

  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      onSaveSuccess(formData as Product);
      showToast(
        `Product ${mode === "create" ? "created" : "updated"} successfully`,
        "success"
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to save product",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteSuccess) return;
    setIsDeleting(true);
    try {
      await onDeleteSuccess(product.id);
      showToast("Product deleted successfully", "success");
      onCancel();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to delete product",
        "error"
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sku: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Piece</label>
            <input
              type="text"
              value={formData.piece}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, piece: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Season</label>
            <input
              type="text"
              value={formData.season}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, season: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-700">Phase</label>
            <select
              value={formData.phase}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phase: e.target.value as Product["phase"],
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="SWATCH">Swatch</option>
              <option value="INITIAL_SAMPLE">Initial Sample</option>
              <option value="FIT_SAMPLE">Fit Sample</option>
              <option value="PRODUCTION_SAMPLE">Production Sample</option>
              <option value="PRODUCTION">Production</option>
            </select>
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div className="flex justify-between border-t pt-6 mt-6">
          {mode === "edit" && onDeleteSuccess && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
            >
              Delete Product
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                ? "Create Product"
                : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {mode === "edit" && onDeleteSuccess && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Product"
          description="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}

```

# app/components/layout/header.tsx

```tsx
// app/components/layout/header.tsx
import { MainNav } from "./main-nav";

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-white/80">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Fashion Inventory
        </h2>
      </div>

      <div className="flex-1 mx-8">
        <MainNav />
      </div>
    </header>
  );
}

```

# app/components/layout/main-nav.tsx

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  // { da riaggiungere quando abbiamo le diverse stagioni
  //   title: "Catalog",
  //   href: "/catalog",
  // },
  {
    title: "Inventory",
    href: "/inventory",
  },
  {
    title: "Operations",
    href: "/operations",
  },
  {
    title: "Contacts",
    href: "/contacts",
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-1">
      {mainNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
            relative group
            ${
              pathname === item.href
                ? "text-black"
                : "text-gray-600 hover:text-black"
            }
          `}
        >
          {item.title}
          <span
            className={`
              absolute bottom-0 left-0 w-full h-0.5 rounded-full transition-all duration-200
              ${
                pathname === item.href
                  ? "bg-black/90 w-full"
                  : "bg-black/0 w-0 group-hover:w-full group-hover:bg-black/20"
              }
            `}
          />
        </Link>
      ))}
    </nav>
  );
}

```

# app/components/layout/sidebar.tsx

```tsx
"use client";

import {
  Box,
  Factory,
  LayoutDashboard,
  Settings,
  Shirt,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Box,
  },
  {
    title: "Products",
    href: "/products",
    icon: Shirt,
  },
  {
    title: "Operations",
    href: "/operations",
    icon: Factory,
  },
  {
    title: "Contacts",
    href: "/contacts",
    icon: Users,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full border-r border-gray-200">
      {/* Logo area */}
      <div className="px-6 py-8 border-b border-gray-100">
        <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Logo
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {sidebarItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <span
              className={`
                flex items-center space-x-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 ease-in-out
                group relative
                ${
                  pathname === item.href
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <item.icon className={`
                w-5 h-5 transition-transform duration-200
                ${pathname === item.href ? "text-gray-900" : "text-gray-500"}
                group-hover:scale-110
              `} />
              <span className={`
                font-medium tracking-tight
                ${pathname === item.href ? "text-gray-900" : "text-gray-600"}
              `}>
                {item.title}
              </span>
              {pathname === item.href && (
                <span className="absolute inset-y-0 left-0 w-1 bg-gray-900 rounded-r-full" />
              )}
            </span>
          </Link>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="px-3 py-6 border-t border-gray-100">
        <Link href="/settings">
          <span className="
            flex items-center space-x-3 px-3 py-2.5 rounded-lg
            text-gray-600 transition-all duration-200
            hover:bg-gray-50 hover:text-gray-900
            group
          ">
            <Settings className="w-5 h-5 text-gray-500 transition-transform duration-200 group-hover:scale-110" />
            <span className="font-medium tracking-tight">Settings</span>
          </span>
        </Link>
      </div>
    </div>
  );
}

```

# app/components/ui/back-button.tsx

```tsx
"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()}
      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
    >
      Back
    </button>
  );
}
```

# app/components/ui/confirm-dialog.tsx

```tsx
"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  isLoading
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <Dialog.Title className="text-xl font-semibold text-center">
              {title}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 text-center">
              {description}
            </Dialog.Description>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

```

# app/components/ui/data-table-row-actions.tsx

```tsx
"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

interface DataTableRowActionsProps {
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
}

export function DataTableRowActions({
  onEdit,
  onDelete,
  onView,
}: DataTableRowActionsProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" className="bg-white rounded-md shadow-lg p-2 min-w-[8rem] border border-gray-200">
          {onView && (
            <DropdownMenu.Item className="flex items-center px-2 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md cursor-pointer" onSelect={onView}>
              View
            </DropdownMenu.Item>
          )}
          {onEdit && (
            <DropdownMenu.Item className="flex items-center px-2 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md cursor-pointer" onSelect={onEdit}>
              Edit
            </DropdownMenu.Item>
          )}
          {onDelete && (
            <DropdownMenu.Item className="flex items-center px-2 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md cursor-pointer" onSelect={onDelete}>
              Delete
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

```

# app/components/ui/details-view.tsx

```tsx
"use client"

interface DetailsItem {
  label: string;
  value: string | number | React.ReactNode;
}

interface DetailsViewProps {
  title: string;
  items: DetailsItem[];
}

export function DetailsView({ title, items }: DetailsViewProps) {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
            <dd className="text-sm text-gray-900">{item.value}</dd>
          </div>
        ))}
      </div>
    </div>
  );
}

```

# app/components/ui/dialog.tsx

```tsx
"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

export function DialogComponent({
  open,
  onOpenChange,
  title,
  children
}: DialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold">
              {title}
            </Dialog.Title>
            <Dialog.Close className="p-2 hover:bg-gray-100 rounded-full">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

```

# app/components/ui/toast.tsx

```tsx
"use client";

import { cn } from "@/lib/utils/styles";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import React, { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            {...toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastNotificationProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

function ToastNotification({
  message,
  type,
  onDismiss,
}: ToastNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: AlertCircle,
  }[type];

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg min-w-[300px] animate-slide-in-right",
        {
          "bg-red-50 text-red-900": type === "error",
          "bg-green-50 text-green-900": type === "success",
          "bg-blue-50 text-blue-900": type === "info",
        }
      )}
    >
      <Icon
        className={cn("w-5 h-5", {
          "text-red-500": type === "error",
          "text-green-500": type === "success",
          "text-blue-500": type === "info",
        })}
      />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onDismiss} className="text-gray-400 hover:text-gray-500">
        <XCircle className="w-5 h-5" />
      </button>
    </div>
  );
}

export default ToastProvider;

```

# app/favicon.ico

This is a binary file of the type: Binary

# app/fonts/GeistMonoVF.woff

This is a binary file of the type: Binary

# app/fonts/GeistVF.woff

This is a binary file of the type: Binary

# app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: #ffffff;
    --foreground: #171717;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --background: #ffffff;
      --foreground: #000000;
    }
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: "GeistVF", system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, sans-serif;
}

/* Custom utilities */
.nav-item-hover {
  @apply hover:bg-gray-50 hover:text-black transition-all duration-200 ease-in-out;
}

.nav-item-active {
  @apply bg-gray-100 text-black font-medium;
}

/* Smooth scrolling */
* {
  scroll-behavior: smooth;
}

/* Better focus styles */
:focus-visible {
  @apply outline-2 outline-blue-500 outline-offset-2 rounded-sm;
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

```

# app/layout.tsx

```tsx
// app/layout.tsx
import { ToastProvider } from "@/components/ui/toast";
import { Header } from "./components/layout/header";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50">
        <ToastProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            {/* <aside className="w-64 bg-white hidden md:block">
              <Sidebar />
            </aside> */}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
              <Header />
              <main className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
                <div className="mx-auto max-w-7xl">{children}</div>
              </main>
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}

```

# app/lib/prisma.ts

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

# app/lib/utils/format.ts

```ts

```

# app/lib/utils/styles.ts

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

# app/lib/utils/validation.ts

```ts

```

# app/page.tsx

```tsx
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              app/page.tsx
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}

```

# app/types/types.ts

```ts
// Common fields that all entities share
type BaseEntity = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string | null;
};

// Enums
export enum InventoryType {
  MATERIAL = "MATERIAL",
  PRODUCT = "PRODUCT",
}

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  PRODUCTION_MANAGER = "PRODUCTION_MANAGER",
  INVENTORY_MANAGER = "INVENTORY_MANAGER",
}

export enum MeasurementUnit {
  GRAM = "GRAM",
  KILOGRAM = "KILOGRAM",
  METER = "METER",
  YARD = "YARD",
}

export enum TransactionType {
  INCOMING = "INCOMING",
  OUTGOING = "OUTGOING",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum MovementType {
  RECEIVED = "RECEIVED",
  CONSUMED = "CONSUMED",
  ADJUSTED = "ADJUSTED",
  RETURNED = "RETURNED",
  SCRAPPED = "SCRAPPED",
}

export enum ContactType {
  SUPPLIER = "SUPPLIER",
  MANUFACTURER = "MANUFACTURER",
  CUSTOMER = "CUSTOMER",
  OTHER = "OTHER",
}

export enum Phase {
  SWATCH = "SWATCH",
  INITIAL_SAMPLE = "INITIAL_SAMPLE",
  FIT_SAMPLE = "FIT_SAMPLE",
  PRODUCTION_SAMPLE = "PRODUCTION_SAMPLE",
  PRODUCTION = "PRODUCTION",
}

// Domain Models
export type User = BaseEntity & {
  email: string;
  name?: string | null;
  role: Role;
};

export type Inventory = BaseEntity & {
  type: InventoryType;
  quantity: number;
  unit: MeasurementUnit;
  location: string;

  // Polymorphic relationship fields
  materialId?: string | null;
  material?: Material | null;
  productId?: string | null;
  product?: Product | null;

  // Relations
  movements: TransactionItem[];
};

export type Transaction = BaseEntity & {
  type: InventoryType;
  transactionType: TransactionType;
  referenceNumber?: string | null;
  supplier?: string | null;
  recipient?: string | null;
  totalPrice?: number | null;
  currency?: string | null;
  orderDate: Date;
  expectedDelivery?: Date | null;
  actualDelivery?: Date | null;
  status: TransactionStatus;

  // Relations
  items: TransactionItem[];
};

export type TransactionItem = BaseEntity & {
  transactionId: string;
  transaction: Transaction;
  inventoryId: string;
  inventory: Inventory;
  quantity: number;
  unit: MeasurementUnit;
  unitPrice?: number | null;
  totalPrice?: number | null;
};

export type Material = BaseEntity & {
  type: string;
  color: string;
  colorCode: string;
  brand: string;
  defaultUnit: MeasurementUnit;
  defaultCostPerUnit: number;
  currency: string;

  // Relations
  inventory: Inventory[];
  products: ProductMaterial[];
};

export type Product = BaseEntity & {
  sku: string;
  piece: string;
  name: string;
  season: string;
  phase: Phase;
  photos: string[];

  // Relations
  materials: ProductMaterial[];
  inventory: Inventory[];
};

export type ProductMaterial = BaseEntity & {
  productId: string;
  product: Product;
  materialId: string;
  material: Material;
  quantity: number;
  unit: MeasurementUnit;
};

export type Contact = BaseEntity & {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  type: ContactType;
};

// Utility types for create/update operations
export type CreateInventoryInput = Omit<
  Inventory,
  "id" | "createdAt" | "updatedAt" | "movements"
>;
export type UpdateInventoryInput = Partial<CreateInventoryInput>;

export type CreateTransactionInput = Omit<
  Transaction,
  "id" | "createdAt" | "updatedAt" | "items"
> & {
  items: Omit<
    TransactionItem,
    "id" | "createdAt" | "updatedAt" | "transaction"
  >[];
};
export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export type CreateMaterialInput = Omit<
  Material,
  "id" | "createdAt" | "updatedAt" | "inventory" | "products"
>;
export type UpdateMaterialInput = Partial<CreateMaterialInput>;

export type CreateProductInput = Omit<
  Product,
  "id" | "createdAt" | "updatedAt" | "materials" | "inventory"
>;
export type UpdateProductInput = Partial<CreateProductInput>;

// Response types for API endpoints
export type InventoryWithRelations = Inventory & {
  material?: Material;
  product?: Product;
  movements: TransactionItem[];
};

export type TransactionWithRelations = Transaction & {
  items: (TransactionItem & {
    inventory: InventoryWithRelations;
  })[];
};

export type MaterialWithRelations = Material & {
  inventory: InventoryWithRelations[];
  products: (ProductMaterial & {
    product: Product;
  })[];
};

export type ProductWithRelations = Product & {
  inventory: InventoryWithRelations[];
  materials: (ProductMaterial & {
    material: Material;
  })[];
};

```

# fashion-inventory.code-workspace

```code-workspace
{
	"folders": [
		{
			"path": "."
		}
	],
	"settings": {
		"tailwindCSS.includeLanguages": {
			"typescript": "javascript",
			"typescriptreact": "javascript"
		},
		"files.associations": {
			"*.css": "tailwindcss",
			"*.scss": "tailwindcss"
		},
		"git.confirmSync": false,
		"path-intellisense.mappings": {
			"@": "${workspaceRoot}/app"
		}
	}
}
```

# next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.

```

# next.config.ts

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

```

# package.json

```json
{
  "name": "fashion-inventory",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "seed": "npx ts-node scripts/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.456.0",
    "next": "15.0.3",
    "react": "19.0.0-rc-66855b96-20241106",
    "react-dom": "19.0.0-rc-66855b96-20241106",
    "tailwind-merge": "^2.5.4",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^20.17.6",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "15.0.3",
    "postcss": "^8",
    "prisma": "^5.22.0",
    "tailwindcss": "^3.4.1",
    "ts-node": "^10.9.2",
    "typescript": "^5.6.3"
  }
}

```

# post_response.json

```json

```

# postcss.config.mjs

```mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;

```

# prisma/migrations/20241109141441_init/migration.sql

```sql
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'PRODUCTION_MANAGER', 'INVENTORY_MANAGER');

-- CreateEnum
CREATE TYPE "Phase" AS ENUM ('SWATCH', 'INITIAL_SAMPLE', 'FIT_SAMPLE', 'PRODUCTION_SAMPLE', 'PRODUCTION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "photos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Style" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "phase" "Phase" NOT NULL,
    "photos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Style_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StyleMaterial" (
    "id" TEXT NOT NULL,
    "styleId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StyleMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "StyleMaterial" ADD CONSTRAINT "StyleMaterial_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleMaterial" ADD CONSTRAINT "StyleMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

```

# prisma/migrations/20241109153541_complete_schema_update/migration.sql

```sql
/*
  Warnings:

  - Added the required column `colorCode` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costPerUnit` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `piece` to the `Style` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `StyleMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MeasurementUnit" AS ENUM ('GRAM', 'KILOGRAM', 'METER', 'YARD');

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "colorCode" TEXT NOT NULL,
ADD COLUMN     "costPerUnit" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "unit" "MeasurementUnit" NOT NULL;

-- AlterTable
ALTER TABLE "Style" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "piece" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StyleMaterial" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "unit" "MeasurementUnit" NOT NULL;

```

# prisma/migrations/20241110210356_rename_styles_to_products/migration.sql

```sql
/*
  Warnings:

  - You are about to drop the `Style` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StyleMaterial` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StyleMaterial" DROP CONSTRAINT "StyleMaterial_materialId_fkey";

-- DropForeignKey
ALTER TABLE "StyleMaterial" DROP CONSTRAINT "StyleMaterial_styleId_fkey";

-- DropTable
DROP TABLE "Style";

-- DropTable
DROP TABLE "StyleMaterial";

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "piece" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "phase" "Phase" NOT NULL,
    "photos" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMaterial" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "MeasurementUnit" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ProductMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- AddForeignKey
ALTER TABLE "ProductMaterial" ADD CONSTRAINT "ProductMaterial_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMaterial" ADD CONSTRAINT "ProductMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

```

# prisma/migrations/20241110221434_add_material_order_and_item/migration.sql

```sql
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "MaterialOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "expectedDelivery" TIMESTAMP(3) NOT NULL,
    "actualDelivery" TIMESTAMP(3),
    "status" "OrderStatus" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "MeasurementUnit" NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MaterialOrder_orderNumber_key" ON "MaterialOrder"("orderNumber");

-- AddForeignKey
ALTER TABLE "MaterialOrderItem" ADD CONSTRAINT "MaterialOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "MaterialOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialOrderItem" ADD CONSTRAINT "MaterialOrderItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

```

# prisma/migrations/20241111030050_add_contacts/migration.sql

```sql
-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('SUPPLIER', 'MANUFACTURER', 'CUSTOMER', 'OTHER');

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "role" TEXT,
    "type" "ContactType" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "Contact"("email");

```

# prisma/migrations/20241122013502_init/migration.sql

```sql
/*
  Warnings:

  - You are about to drop the column `costPerUnit` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `photos` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Material` table. All the data in the column will be lost.
  - Added the required column `defaultCostPerUnit` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultUnit` to the `Material` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('RECEIVED', 'CONSUMED', 'ADJUSTED', 'RETURNED', 'SCRAPPED');

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "costPerUnit",
DROP COLUMN "location",
DROP COLUMN "photos",
DROP COLUMN "quantity",
DROP COLUMN "unit",
ADD COLUMN     "defaultCostPerUnit" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "defaultUnit" "MeasurementUnit" NOT NULL;

-- CreateTable
CREATE TABLE "MaterialInventory" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "MeasurementUnit" NOT NULL,
    "location" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialMovement" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "MeasurementUnit" NOT NULL,
    "type" "MovementType" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialMovement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MaterialInventory" ADD CONSTRAINT "MaterialInventory_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovement" ADD CONSTRAINT "MaterialMovement_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

```

# prisma/migrations/migration_lock.toml

```toml
# Please do not edit this file manually
# It should be added in your version-control system (i.e. Git)
provider = "postgresql"
```

# prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User management for application access control
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Common inventory tracking for both materials and products
// This unified model eliminates duplication between former MaterialInventory and ProductInventory
// The type field (MATERIAL/PRODUCT) determines which foreign key (materialId/productId) is used
model Inventory {
  id        String          @id @default(cuid())
  type      InventoryType   // Discriminator field to distinguish between material and product inventory
  quantity  Float
  unit      MeasurementUnit
  location  String
  notes     String?
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt

  // Semi-polymorphic relationship - only one of these will be set based on type
  materialId String?
  material   Material?      @relation(fields: [materialId], references: [id])
  productId  String?
  product    Product?       @relation(fields: [productId], references: [id])

  // Each inventory record can have multiple transaction items (movements)
  movements TransactionItem[]
}

// Common transaction model for tracking both material and product movements
// Consolidates shared fields between former MaterialTransaction and ProductTransaction
model Transaction {
  id               String            @id @default(cuid())
  type            InventoryType     // Matches the inventory type this transaction relates to
  transactionType  TransactionType   // Tracks if items are coming in or going out
  referenceNumber  String?          // External reference (PO number, invoice number, etc.)
  supplier         String?          // Source for INCOMING transactions
  recipient        String?          // Destination for OUTGOING transactions
  items            TransactionItem[]
  totalPrice       Float?
  currency         String?
  orderDate        DateTime
  expectedDelivery DateTime?
  actualDelivery   DateTime?
  status           TransactionStatus
  notes            String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
}

// Links transactions to specific inventory items
// Records the quantity and pricing details of each item in a transaction
model TransactionItem {
  id           String       @id @default(cuid())
  transactionId String
  transaction   Transaction @relation(fields: [transactionId], references: [id])
  inventoryId   String
  inventory     Inventory   @relation(fields: [inventoryId], references: [id])
  quantity      Float
  unit          MeasurementUnit
  unitPrice     Float?
  totalPrice    Float?
  notes         String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

// Represents raw materials used in production
// Examples: fabrics, buttons, zippers, thread
model Material {
  id                 String          @id @default(cuid())
  type               String          // Category of material (e.g., "fabric", "button")
  color              String
  colorCode          String         // Reference color code for consistency
  brand              String
  defaultUnit        MeasurementUnit // Standard unit for measuring this material
  defaultCostPerUnit Float           // Standard cost for purchasing calculations
  currency           String
  notes              String?
  createdAt          DateTime        @default(now())
  updatedAt          DateTime        @updatedAt

  // Relations
  inventory  Inventory[]        // Tracks stock levels across locations
  products   ProductMaterial[]  // Links to products where this material is used
}

// Represents finished or in-progress products
// Examples: shirts, dresses, accessories
model Product {
  id        String            @id @default(cuid())
  sku       String            @unique  // Unique product identifier
  piece     String            // Type of garment
  name      String
  season    String            // Collection/season identifier
  phase     Phase             // Current development/production stage
  photos    String[]          // Array of photo URLs
  notes     String?
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt

  // Relations
  materials ProductMaterial[] // Bill of materials - what goes into making this product
  inventory Inventory[]       // Tracks stock levels across locations
}

// Associates materials with products
// Acts as a bill of materials (BOM) for each product
model ProductMaterial {
  id         String          @id @default(cuid())
  product    Product         @relation(fields: [productId], references: [id])
  productId  String
  material   Material        @relation(fields: [materialId], references: [id])
  materialId String
  quantity   Float           // How much of the material is needed for one product
  unit       MeasurementUnit
  notes      String?
}

// Stores information about external parties
// Used for suppliers, manufacturers, customers
model Contact {
  id        String      @id @default(cuid())
  name      String
  email     String      @unique
  phone     String?
  company   String?
  role      String?
  type      ContactType // Categorizes the contact's relationship to the business
  notes     String?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

// Enums for standardizing choices across the application

enum InventoryType {
  MATERIAL  // Raw materials inventory
  PRODUCT   // Finished goods inventory
}

enum Role {
  ADMIN
  USER
  PRODUCTION_MANAGER
  INVENTORY_MANAGER
}

enum MeasurementUnit {
  GRAM
  KILOGRAM
  METER
  YARD
}

enum TransactionType {
  INCOMING  // Receiving inventory
  OUTGOING  // Shipping/using inventory
}

enum TransactionStatus {
  PENDING    // Transaction created but not confirmed
  CONFIRMED  // Transaction verified and approved
  SHIPPED    // Items in transit
  DELIVERED  // Items received at destination
  CANCELLED  // Transaction voided
}

enum MovementType {
  RECEIVED  // New inventory received
  CONSUMED  // Used in production
  ADJUSTED  // Inventory count corrections
  RETURNED  // Sent back to supplier
  SCRAPPED  // Damaged or unusable
}

enum ContactType {
  SUPPLIER
  MANUFACTURER
  CUSTOMER
  OTHER
}

enum Phase {
  SWATCH             // Initial material selection
  INITIAL_SAMPLE     // First prototype
  FIT_SAMPLE        // Size/fit testing
  PRODUCTION_SAMPLE // Final pre-production version
  PRODUCTION        // Active manufacturing
}
```

# public/file.svg

This is a file of the type: SVG Image

# public/globe.svg

This is a file of the type: SVG Image

# public/next.svg

This is a file of the type: SVG Image

# public/vercel.svg

This is a file of the type: SVG Image

# public/window.svg

This is a file of the type: SVG Image

# README.md

```md
npx ai-digest

```

# response.json

```json
[]
```

# scripts/debug-db.ts

```ts
import { PrismaClient } from "@prisma/client";

async function debugDatabase() {
  const prisma = new PrismaClient();

  try {
    console.log("Attempting to connect to database...");
    await prisma.$connect();
    console.log("Successfully connected to database");

    // Check all models
    console.log("\nChecking all models...");
    const models = Object.keys(prisma).filter((key) => !key.startsWith("$"));
    console.log("Available models:", models);

    // Check contacts specifically
    console.log("\nChecking contacts...");
    const contactCount = await prisma.contact.count();
    console.log("Number of contacts:", contactCount);

    if (contactCount > 0) {
      const contacts = await prisma.contact.findMany();
      console.log("First contact:", contacts[0]);
      console.log("Total contacts found:", contacts.length);
    }

    // Check related models
    console.log("\nChecking other models...");
    const materialCount = await prisma.material.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.materialOrder.count();

    console.log("Database summary:");
    console.log("- Contacts:", contactCount);
    console.log("- Materials:", materialCount);
    console.log("- Products:", productCount);
    console.log("- Material Orders:", orderCount);
  } catch (error) {
    console.error("Error during database debug:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDatabase().catch((e) => {
  console.error("Script error:", e);
  process.exit(1);
});

```

# scripts/seed.ts

```ts
import {
  ContactType,
  MeasurementUnit,
  MovementType,
  OrderStatus,
  Phase,
  PrismaClient,
  Role,
} from "@prisma/client";

const prisma = new PrismaClient();

// Sample data arrays
const users = [
  {
    email: "admin@company.com",
    name: "Admin User",
    role: Role.ADMIN,
  },
  {
    email: "production@company.com",
    name: "Production Manager",
    role: Role.PRODUCTION_MANAGER,
  },
  {
    email: "inventory@company.com",
    name: "Inventory Manager",
    role: Role.INVENTORY_MANAGER,
  },
  {
    email: "user@company.com",
    name: "Regular User",
    role: Role.USER,
  },
];

const materials = [
  {
    type: "Cotton",
    color: "Linen White",
    colorCode: "2071",
    brand: "Campolmi",
    defaultUnit: MeasurementUnit.KILOGRAM,
    defaultCostPerUnit: 25.0,
    currency: "EUR",
    notes: "30/2x4x4",
  },
  {
    type: "Cotton",
    color: "Navy Blue",
    colorCode: "2108",
    brand: "Campolmi",
    defaultUnit: MeasurementUnit.KILOGRAM,
    defaultCostPerUnit: 28.0,
    currency: "EUR",
    notes: "30/2x4x4",
  },
  {
    type: "Cotton",
    color: "Black",
    colorCode: "2094",
    brand: "Campolmi",
    defaultUnit: MeasurementUnit.KILOGRAM,
    defaultCostPerUnit: 26.0,
    currency: "EUR",
    notes: "30/2x4x4",
  },
  {
    type: "Linen",
    color: "Natural",
    colorCode: "L001",
    brand: "European Linen",
    defaultUnit: MeasurementUnit.METER,
    defaultCostPerUnit: 15.0,
    currency: "EUR",
    notes: "100% European Linen",
  },
];

const products = [
  {
    piece: "Scrunchie with Picot Trim",
    name: "Classic",
    sku: "SCRUNCH-PICOT-001",
    season: "SS24",
    phase: Phase.PRODUCTION,
    notes: "Best seller",
  },
  {
    piece: "Bucket Hat",
    name: "Classic",
    sku: "BUCKET-CLASS-001",
    season: "SS24",
    phase: Phase.PRODUCTION_SAMPLE,
    notes: "New design",
  },
  {
    piece: "Wide Brim Sun Hat",
    name: "Stripes",
    sku: "WBRIM-STRIP-001",
    season: "SS24",
    phase: Phase.FIT_SAMPLE,
    notes: "In development",
  },
];

const contacts = [
  {
    name: "John Smith",
    email: "john.smith@supplier.com",
    phone: "+1 (555) 123-4567",
    company: "Campolmi Florence",
    role: "Sales Representative",
    type: ContactType.SUPPLIER,
    notes: "Main fabric supplier contact",
  },
  {
    name: "Maria Garcia",
    email: "maria.garcia@manufacturer.com",
    phone: "+1 (555) 234-5678",
    company: "Quality Manufacturing Co.",
    role: "Production Manager",
    type: ContactType.MANUFACTURER,
    notes: "Primary manufacturing contact",
  },
];

async function seed() {
  try {
    // Clear all existing data
    await prisma.$transaction([
      prisma.materialMovement.deleteMany(),
      prisma.materialInventory.deleteMany(),
      prisma.materialOrderItem.deleteMany(),
      prisma.materialOrder.deleteMany(),
      prisma.productMaterial.deleteMany(),
      prisma.product.deleteMany(),
      prisma.material.deleteMany(),
      prisma.contact.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    console.log("Cleared existing data");

    // Create users
    const createdUsers = await Promise.all(
      users.map((user) =>
        prisma.user.create({
          data: user,
        })
      )
    );
    console.log(`Created ${createdUsers.length} users`);

    // Create materials
    const createdMaterials = await Promise.all(
      materials.map(async (material) => {
        const createdMaterial = await prisma.material.create({
          data: material,
        });

        // Create inventory entry for each material
        await prisma.materialInventory.create({
          data: {
            materialId: createdMaterial.id,
            quantity: Math.floor(Math.random() * 100),
            unit: material.defaultUnit,
            location: "Main Warehouse",
            notes: "Initial stock",
          },
        });

        // Create some random movements for each material
        const movementTypes = [
          MovementType.RECEIVED,
          MovementType.CONSUMED,
          MovementType.ADJUSTED,
        ];
        for (let i = 0; i < 3; i++) {
          await prisma.materialMovement.create({
            data: {
              materialId: createdMaterial.id,
              quantity: Math.floor(Math.random() * 50),
              unit: material.defaultUnit,
              type: movementTypes[i],
              reference: `REF-${Date.now()}-${i}`,
              notes: `Sample ${movementTypes[i]} movement`,
            },
          });
        }

        return createdMaterial;
      })
    );
    console.log(
      `Created ${createdMaterials.length} materials with inventory and movements`
    );

    // Create products
    const createdProducts = await Promise.all(
      products.map(async (product) => {
        const createdProduct = await prisma.product.create({
          data: product,
        });

        // Create product-material relationships
        await prisma.productMaterial.create({
          data: {
            productId: createdProduct.id,
            materialId:
              createdMaterials[
                Math.floor(Math.random() * createdMaterials.length)
              ].id,
            quantity: Math.random() * 5,
            unit: MeasurementUnit.METER,
            notes: "Primary material",
          },
        });

        return createdProduct;
      })
    );
    console.log(
      `Created ${createdProducts.length} products with material relationships`
    );

    // Create material orders
    const orders = [];
    for (let i = 1; i <= 3; i++) {
      const order = await prisma.materialOrder.create({
        data: {
          orderNumber: `MO-2024-00${i}`,
          supplier: "Campolmi Florence",
          totalPrice: Math.floor(Math.random() * 5000) + 1000,
          currency: "EUR",
          orderDate: new Date(2024, 0, i * 5),
          expectedDelivery: new Date(2024, 1, i * 5),
          actualDelivery: i === 1 ? new Date(2024, 1, i * 5) : null,
          status:
            i === 1
              ? OrderStatus.DELIVERED
              : i === 2
              ? OrderStatus.CONFIRMED
              : OrderStatus.PENDING,
          notes: `Order ${i} notes`,
        },
      });

      // Create 2-3 order items for each order
      const numItems = Math.floor(Math.random() * 2) + 2;
      for (let j = 0; j < numItems; j++) {
        const material =
          createdMaterials[Math.floor(Math.random() * createdMaterials.length)];
        const quantity = Math.floor(Math.random() * 50) + 10;

        await prisma.materialOrderItem.create({
          data: {
            orderId: order.id,
            materialId: material.id,
            quantity: quantity,
            unit: material.defaultUnit,
            unitPrice: material.defaultCostPerUnit,
            totalPrice: quantity * material.defaultCostPerUnit,
            notes: `Order item for ${material.color}`,
          },
        });
      }

      orders.push(order);
    }
    console.log(`Created ${orders.length} orders with items`);

    // Create contacts
    const createdContacts = await Promise.all(
      contacts.map((contact) =>
        prisma.contact.create({
          data: contact,
        })
      )
    );
    console.log(`Created ${createdContacts.length} contacts`);

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

```

# scripts/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es2017",
    "module": "commonjs",
    "lib": ["es2017", "esnext.asynciterable"],
    "skipLibCheck": true,
    "sourceMap": true,
    "outDir": "./dist",
    "moduleResolution": "node",
    "removeComments": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "resolveJsonModule": true,
    "baseUrl": "."
  },
  "exclude": ["node_modules"],
  "include": ["./seed.ts"]
}
```

# setup-material-edit.sh

```sh
#!/bin/bash

# First, create a confirm dialog component for delete confirmation
mkdir -p app/components/ui
cat > app/components/ui/confirm-dialog.tsx << 'EOL'
"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  isLoading
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <Dialog.Title className="text-xl font-semibold text-center">
              {title}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 text-center">
              {description}
            </Dialog.Description>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
EOL

# Update Material Edit Form with delete functionality
cat > app/components/forms/material-edit-form.tsx << 'EOL'
"use client";

import { Material, MeasurementUnit } from "@/types/material";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface MaterialEditFormProps {
  material: Material;
  onSave: (updatedMaterial: Partial<Material>) => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}

export function MaterialEditForm({ material, onSave, onDelete, onCancel }: MaterialEditFormProps) {
  const [formData, setFormData] = useState({
    type: material.type,
    color: material.color,
    colorCode: material.colorCode,
    brand: material.brand,
    quantity: material.quantity,
    unit: material.unit,
    costPerUnit: material.costPerUnit,
    currency: material.currency,
    location: material.location,
    notes: material.notes || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving material:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Error deleting material:', error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Existing form fields remain the same */}
        {/* ... */}

        <div className="flex justify-between border-t pt-6 mt-6">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
          >
            Delete Material
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Material"
        description="Are you sure you want to delete this material? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
EOL

# Update Product Edit Form with delete functionality
cat > app/components/forms/product-edit-form.tsx << 'EOL'
"use client";

import { Product } from "@/types/product";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ProductEditFormProps {
  product: Product;
  onSave: (updatedProduct: Partial<Product>) => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}

export function ProductEditForm({ product, onSave, onDelete, onCancel }: ProductEditFormProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    piece: product.piece,
    season: product.season,
    phase: product.phase,
    notes: product.notes || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Error deleting product:', error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Existing form fields remain the same */}
        {/* ... */}

        <div className="flex justify-between border-t pt-6 mt-6">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
          >
            Delete Product
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
EOL

# Add DELETE method to material API route
cat > app/api/materials/\[materialId\]/route.ts << 'EOL'
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ... keep existing GET and PATCH methods ...

export async function DELETE(
  _request: Request,
  { params }: { params: { materialId: string } }
) {
  try {
    await prisma.material.delete({
      where: {
        id: params.materialId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error deleting material" },
      { status: 500 }
    );
  }
}
EOL

# Add DELETE method to product API route
cat > app/api/products/\[productId\]/route.ts << 'EOL'
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ... keep existing GET and PATCH methods ...

export async function DELETE(
  _request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    await prisma.product.delete({
      where: {
        id: params.productId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error deleting product" },
      { status: 500 }
    );
  }
}
EOL

# Add delete handler to materials table
sed -i '' 's/onDelete={() => console.log(/onDelete={async () => {\
      if (!confirm("Are you sure you want to delete this material?")) return;\
      try {\
        const response = await fetch(`\/api\/materials\/${/g' app/components/data-tables/materials-table.tsx
sed -i '' 's/material.id)}/material.id}`, { method: "DELETE" });\
        if (!response.ok) throw new Error("Failed to delete material");\
        setMaterials(materials.filter(m => m.id !== material.id));\
      } catch (error) {\
        console.error("Error deleting material:", error);\
      }\
    }}/g' app/components/data-tables/materials-table.tsx

# Add delete handler to products table
sed -i '' 's/onDelete={() => console.log(/onDelete={async () => {\
      if (!confirm("Are you sure you want to delete this product?")) return;\
      try {\
        const response = await fetch(`\/api\/products\/${/g' app/components/data-tables/products-table.tsx
sed -i '' 's/product.id)}/product.id}`, { method: "DELETE" });\
        if (!response.ok) throw new Error("Failed to delete product");\
        setProducts(products.filter(p => p.id !== product.id));\
      } catch (error) {\
        console.error("Error deleting product:", error);\
      }\
    }}/g' app/components/data-tables/products-table.tsx

echo "Setup complete! The following files have been created/updated:"
echo "1. app/components/ui/confirm-dialog.tsx"
echo "2. app/components/forms/material-edit-form.tsx"
echo "3. app/components/forms/product-edit-form.tsx"
echo "4. app/api/materials/[materialId]/route.ts"
echo "5. app/api/products/[productId]/route.ts"
echo "6. app/components/data-tables/materials-table.tsx"
echo "7. app/components/data-tables/products-table.tsx"
echo "Make sure to update the parent components to handle the new onDelete prop"

```

# tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;

```

# tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./app/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

