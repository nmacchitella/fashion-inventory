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

# app/(routes)/inventory/inventory-controls.tsx

```tsx
// app/inventory/inventory-controls.tsx
"use client";

import { MaterialsTable } from "@/components/data-tables/materials-table";
import { AddMaterialDialog } from "@/components/forms/add-material-dialog";
import { Material } from "@/types/material";
import { useState } from "react";

interface InventoryControlsProps {
  initialMaterials: Material[];
}

export function InventoryControls({
  initialMaterials,
}: InventoryControlsProps) {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete material");
      }

      // Only update the UI if deletion was successful
      setMaterials((prevMaterials) =>
        prevMaterials.filter((m) => m.id !== materialId)
      );

      return data;
    } catch (error) {
      console.error("Error deleting material:", error);
      throw error;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Add Material
        </button>
      </div>

      <MaterialsTable
        materials={materials}
        onDelete={handleDelete}
        onUpdate={(updatedMaterial) => {
          setMaterials((prevMaterials) =>
            prevMaterials.map((m) =>
              m.id === updatedMaterial.id ? updatedMaterial : m
            )
          );
        }}
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
import { Material } from "@/types/material";
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

# app/(routes)/inventory/page.tsx

```tsx
// app/inventory/page.tsx
import { prisma } from "@/lib/prisma";
import { InventoryControls } from "./inventory-controls";

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
      <InventoryControls initialMaterials={initialMaterials} />
    </div>
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
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={() => setIsEditDialogOpen(false)}
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

# app/(routes)/products/[productId]/page.tsx

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

# app/(routes)/products/loading.tsx

```tsx
export default function ProductsLoading() {
  return (
    <div className="w-full h-24 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
}

```

# app/(routes)/products/page.tsx

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

# app/(routes)/products/products-controls.tsx

```tsx
"use client";

import { ProductsTable } from "@/components/data-tables/products-table";
import { AddProductDialog } from "@/components/forms/add-product-dialog";
import { Product } from "@/types/product";
import { useState } from "react";

interface ProductsControlsProps {
  initialProducts: Product[];
}

export function ProductsControls({ initialProducts }: ProductsControlsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [products, setProducts] = useState(initialProducts);

  const handleAddSuccess = (newProduct: Product) => {
    setProducts((prevProducts) => [newProduct, ...prevProducts]);
    setIsAddDialogOpen(false);
  };

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(errorData);
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
 
      <ProductsTable
        products={products}
        onDelete={handleDelete}
        onUpdate={(updatedProduct) => {
          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p.id === updatedProduct.id ? updatedProduct : p
            )
          );
        }}
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
  context: { params: { orderId: string } }
) {
  try {
    // First, delete all associated order items
    const deletedItems = await prisma.materialOrderItem.deleteMany({
      where: {
        orderId: context.params.orderId,
      },
    });
    console.log("Deleted order items:", deletedItems);

    // Then delete the order itself
    const deletedOrder = await prisma.materialOrder.delete({
      where: {
        id: context.params.orderId,
      },
    });
    console.log("Deleted order:", deletedOrder);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Detailed error in DELETE API:", error);
    return NextResponse.json(
      {
        message: "Failed to delete order",
        error: error instanceof Error ? error.message : "Unknown error",
      },
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
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { materialId: string } }
) {
  try {
    const material = await prisma.material.findUnique({
      where: {
        id: params.materialId,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        materialOrderItems: {
          include: {
            order: true,
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
    console.error("Error:", error);
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

    const material = await prisma.material.update({
      where: {
        id: params.materialId,
      },
      data: {
        type: json.type,
        color: json.color,
        colorCode: json.colorCode,
        brand: json.brand,
        quantity: parseFloat(json.quantity),
        unit: json.unit,
        costPerUnit: parseFloat(json.costPerUnit),
        currency: json.currency,
        location: json.location,
        notes: json.notes || null,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        materialOrderItems: {
          include: {
            order: true,
          },
        },
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error updating material" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ materialId: string }> }
) {
  try {
    console.log("----1");
    // Await the params
    const { materialId } = await context.params;
    console.log("----2");

    if (!materialId) {
      return NextResponse.json(
        { message: "Material ID is required" },
        { status: 400 }
      );
    }
    console.log("----3");
    // Check if material exists
    const existingMaterial = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        _count: {
          select: {
            products: true,
            materialOrderItems: true,
          },
        },
      },
    });

    console.log("----4");

    if (!existingMaterial) {
      return NextResponse.json(
        { message: "Material not found" },
        { status: 404 }
      );
    }
    console.log("----5");
    // Check if material is used in any products or orders
    if (
      existingMaterial._count.products > 0 ||
      existingMaterial._count.materialOrderItems > 0
    ) {
      return new NextResponse(
        JSON.stringify({
          message: "Cannot delete material because it is in use",
          details: {
            productsCount: existingMaterial._count.products,
            ordersCount: existingMaterial._count.materialOrderItems,
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("----6");

    // Delete the material
    await prisma.material.delete({
      where: {
        id: materialId,
      },
    });

    return NextResponse.json(
      {
        message: "Material deleted successfully",
        deletedId: materialId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE API:", error);
    return NextResponse.json(
      {
        message: "Failed to delete material",
        error: error instanceof Error ? error.message : "Unknown error",
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
    const materials = await prisma.material.findMany();
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

    // Validate required fields
    const requiredFields = [
      "type",
      "color",
      "colorCode",
      "brand",
      "quantity",
      "unit",
      "costPerUnit",
      "currency",
      "location",
    ];

    for (const field of requiredFields) {
      // Changed validation to check for undefined or null
      if (json[field] === undefined || json[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Additional validation for numeric fields
    if (
      typeof json.quantity !== "number" &&
      typeof parseFloat(json.quantity) !== "number"
    ) {
      return NextResponse.json(
        { error: "Quantity must be a number" },
        { status: 400 }
      );
    }

    if (
      typeof json.costPerUnit !== "number" &&
      typeof parseFloat(json.costPerUnit) !== "number"
    ) {
      return NextResponse.json(
        { error: "Cost per unit must be a number" },
        { status: 400 }
      );
    }

    const material = await prisma.material.create({
      data: {
        type: json.type,
        color: json.color,
        colorCode: json.colorCode,
        brand: json.brand,
        quantity: parseFloat(json.quantity),
        unit: json.unit,
        costPerUnit: parseFloat(json.costPerUnit),
        currency: json.currency,
        location: json.location,
        notes: json.notes || null,
        photos: json.photos || [],
      },
    });

    return NextResponse.json(material);
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
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error:", error);
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

    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: json,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error updating product" },
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

    // First check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        materials: true,
      },
    });

    if (!product) {
      console.log("Product not found:", productId);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Use a transaction to ensure all operations complete successfully
    await prisma.$transaction(async (tx) => {
      // First delete all product-material relationships
      await tx.productMaterial.deleteMany({
        where: {
          productId: productId,
        },
      });

      // Then delete the product
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
    console.log("hello");
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

    // Validate required fields
    const requiredFields = ["sku", "piece", "name", "season", "phase"];

    for (const field of requiredFields) {
      if (!json[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.create({
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

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error creating product" },
      { status: 500 }
    );
  }
}

```

# app/api/stylematerial/route.ts

```ts
// import { prisma } from "@/app/lib/prisma";
// import { NextResponse } from "next/server";

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

# app/components/data-tables/contacts-table.tsx

```tsx
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

  const handleDeleteSuccess = async (orderId: string) => {
    try {
      const response = await fetch(`/api/material-orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      onDelete(orderId);
      setIsEditDialogOpen(false);
      setSelectedOrder(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
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
            onDeleteSuccess={handleDeleteSuccess}
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

# app/components/data-tables/materials-table.tsx

```tsx
"use client";

import { MaterialEditForm } from "@/components/forms/material-edit-form";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { DialogComponent } from "@/components/ui/dialog";
import { Material } from "@/types/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface MaterialsTableProps {
  materials: Material[];
  onDelete?: (materialId: string) => void;
  onUpdate?: (updatedMaterial: Material) => void;
}

interface Column {
  header: string;
  accessorKey: string;
  cell?: (item: Material) => React.ReactNode;
}

const columns: Column[] = [
  {
    header: "Type",
    accessorKey: "type",
  },
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
    accessorKey: "quantity",
    cell: (material) => `${material.quantity} ${material.unit}`,
  },
  {
    header: "Location",
    accessorKey: "location",
  },
  {
    header: "Brand",
    accessorKey: "brand",
  },
];

export function MaterialsTable({
  materials,
  onDelete,
  onUpdate,
}: MaterialsTableProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (updatedMaterial: Partial<Material>) => {
    if (!selectedMaterial) return;

    try {
      const response = await fetch(`/api/materials/${selectedMaterial.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMaterial),
      });

      if (!response.ok) {
        throw new Error("Failed to update material");
      }

      const updated = await response.json();

      if (onUpdate) {
        onUpdate(updated);
      }

      setIsEditDialogOpen(false);
      setSelectedMaterial(null);
    } catch (error) {
      console.error("Error updating material:", error);
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
            {materials.map((material) => (
              <tr key={material.id} className="border-b hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={`${material.id}-${column.accessorKey}`}
                    className="px-4 py-2 text-sm"
                  >
                    {column.cell
                      ? column.cell(material)
                      : String(material[column.accessorKey as keyof Material])}
                  </td>
                ))}
                <td className="px-4 py-2 text-sm">
                  <DataTableRowActions
                    onView={() =>
                      router.push(`/inventory/materials/${material.id}`)
                    }
                    onEdit={() => handleEdit(material)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMaterial && (
        <DialogComponent
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setSelectedMaterial(null);
          }}
          title="Edit Material"
        >
          <MaterialEditForm
            material={selectedMaterial}
            onSaveSuccess={handleSave}
            onDeleteSuccess={onDelete}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedMaterial(null);
            }}
            mode="edit"
          />
        </DialogComponent>
      )}
    </>
  );
}

```

# app/components/data-tables/products-table.tsx

```tsx
"use client";

import { ProductEditForm } from "@/components/forms/product-edit-form";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { DialogComponent } from "@/components/ui/dialog";
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductsTableProps {
  products: Product[];
  onDelete?: (productId: string) => void;
  onUpdate?: (updatedProduct: Product) => void;
}

interface Column {
  header: string;
  accessorKey: string;
  cell?: (item: Product) => React.ReactNode;
}

const columns: Column[] = [
  {
    header: "SKU",
    accessorKey: "sku",
  },
  {
    header: "Piece",
    accessorKey: "piece",
  },
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Season",
    accessorKey: "season",
  },
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

export function ProductsTable({
  products,
  onDelete,
  onUpdate,
}: ProductsTableProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (updatedProduct: Partial<Product>) => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
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

      if (onUpdate) {
        onUpdate(updated);
      }

      setIsEditDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
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
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={`${product.id}-${column.accessorKey}`}
                    className="px-4 py-2 text-sm"
                  >
                    {column.cell
                      ? column.cell(product)
                      : String(product[column.accessorKey as keyof Product])}
                  </td>
                ))}
                <td className="px-4 py-2 text-sm">
                  <DataTableRowActions
                    onView={() => router.push(`/products/${product.id}`)}
                    onEdit={() => handleEdit(product)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedProduct && (
        <DialogComponent
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setSelectedProduct(null);
          }}
          title="Edit Product"
        >
          <ProductEditForm
            product={selectedProduct}
            onSaveSuccess={handleSave}
            onDeleteSuccess={onDelete}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedProduct(null);
            }}
            mode="edit"
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
import { Material, MeasurementUnit } from "@/types/material";

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

# app/components/forms/material-edit-form.tsx

```tsx
"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Material, MeasurementUnit } from "@/types/material";
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
import { MaterialOrder, OrderStatus } from "@/types/materialOrder";
import { useState } from "react";

interface MaterialOrderEditFormProps {
  order: MaterialOrder;
  onSaveSuccess: (updatedOrder: MaterialOrder) => void;
  onDeleteSuccess?: (orderId: string) => Promise<void>;
  onCancel: () => void;
  mode?: "edit" | "create";
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

  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const processedData = {
        ...formData,
        totalPrice: parseFloat(formData.totalPrice.toString()),
        orderDate: new Date(formData.orderDate),
        expectedDelivery: new Date(formData.expectedDelivery),
        actualDelivery: formData.actualDelivery
          ? new Date(formData.actualDelivery)
          : null,
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
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="flex justify-between border-t pt-6 mt-6">
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
              disabled={isSaving}
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
  {
    title: "Inventory",
    href: "/inventory",
  },
  {
    title: "Products",
    href: "/products",
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

# app/types/contact.ts

```ts
export enum ContactType {
  SUPPLIER = 'SUPPLIER',
  MANUFACTURER = 'MANUFACTURER',
  CUSTOMER = 'CUSTOMER',
  OTHER = 'OTHER'
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  type: ContactType;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

# app/types/material.ts

```ts
export enum MeasurementUnit {
  GRAM = 'GRAM',
  KILOGRAM = 'KILOGRAM',
  METER = 'METER',
  YARD = 'YARD',
}

export interface Material {
  id: string;
  type: string;
  color: string;
  colorCode: string;
  brand: string;
  quantity: number;
  unit: MeasurementUnit;
  costPerUnit: number;
  currency: string;
  location: string;
  notes?: string;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}

```

# app/types/materialOrder.ts

```ts
// types/materialOrder.ts

export enum MeasurementUnit {
  GRAM = 'GRAM',
  KILOGRAM = 'KILOGRAM',
  METER = 'METER',
  YARD = 'YARD',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface MaterialOrderItem {
  id: string;
  orderId: string;
  materialId: string;
  quantity: number;
  unit: MeasurementUnit;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  orderItems: MaterialOrderItem[];
  totalPrice: number;
  currency: string;
  orderDate: Date;
  expectedDelivery: Date;
  actualDelivery?: Date;
  status: OrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

# app/types/product.ts

```ts
export interface Product {
  id: string;
  sku: string;
  piece: string;
  name: string;
  season: string;
  phase: 'SWATCH' | 'INITIAL_SAMPLE' | 'FIT_SAMPLE' | 'PRODUCTION_SAMPLE' | 'PRODUCTION';
  notes?: string;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

# app/types/shared.ts

```ts

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

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  ADMIN
  USER
  PRODUCTION_MANAGER
  INVENTORY_MANAGER
}

model Material {
  id                 String              @id @default(cuid())
  type               String
  color              String
  colorCode          String
  brand              String
  quantity           Float
  unit               MeasurementUnit
  costPerUnit        Float
  currency           String
  location           String
  notes              String?
  photos             String[]
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
  products           ProductMaterial[] // Changed from styleItems
  materialOrderItems MaterialOrderItem[] // Added opposite relation field
}

enum MeasurementUnit {
  GRAM
  KILOGRAM
  METER
  YARD
}

model Product {
  id        String            @id @default(cuid())
  sku       String            @unique
  piece     String
  name      String
  season    String
  phase     Phase
  materials ProductMaterial[]
  photos    String[]
  notes     String?
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt
}

model ProductMaterial {
  id         String          @id @default(cuid())
  product    Product         @relation(fields: [productId], references: [id])
  productId  String
  material   Material        @relation(fields: [materialId], references: [id])
  materialId String
  quantity   Float
  unit       MeasurementUnit
  notes      String?
}

enum Phase {
  SWATCH
  INITIAL_SAMPLE
  FIT_SAMPLE
  PRODUCTION_SAMPLE
  PRODUCTION
}

model MaterialOrder {
  id               String              @id @default(cuid())
  orderNumber      String              @unique
  supplier         String
  orderItems       MaterialOrderItem[]
  totalPrice       Float
  currency         String
  orderDate        DateTime
  expectedDelivery DateTime
  actualDelivery   DateTime?
  status           OrderStatus
  notes            String?
  createdAt        DateTime            @default(now())
  updatedAt        DateTime            @updatedAt
}

model MaterialOrderItem {
  id         String          @id @default(cuid())
  order      MaterialOrder   @relation(fields: [orderId], references: [id])
  orderId    String
  material   Material        @relation(fields: [materialId], references: [id])
  materialId String
  quantity   Float
  unit       MeasurementUnit
  unitPrice  Float
  totalPrice Float
  notes      String?
  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

model Contact {
  id        String      @id @default(cuid())
  name      String
  email     String      @unique
  phone     String?
  company   String?
  role      String?
  type      ContactType
  notes     String?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

enum ContactType {
  SUPPLIER
  MANUFACTURER
  CUSTOMER
  OTHER
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
// scripts/seed.ts
import { PrismaClient } from "@prisma/client";
import { ContactType } from "../app/types/contact";
import { MeasurementUnit, OrderStatus } from "../app/types/materialOrder";

const prisma = new PrismaClient();

const materials = [
  { color: "Linen White", colorCode: "2071" },
  { color: "Linen AAA", colorCode: "2571" },
  { color: "Navy Blue", colorCode: "2108" },
  { color: "Orange", colorCode: "2088" },
  { color: "Pink", colorCode: "2102" },
  { color: "Yellow", colorCode: "2091" },
  { color: "Almond", colorCode: "2072" },
  { color: "Black", colorCode: "2094" },
  { color: "Cerulean Blue", colorCode: "2098" },
  { color: "Dark Green", colorCode: "2095" },
  { color: "Light Green", colorCode: "2083" },
];

const products = [
  {
    piece: "Scrunchie with Picot Trim",
    name: "Classic",
    sku: "SCRUNCH-PICOT-001",
  },
  { piece: "Bracelet", name: "Classic", sku: "BRACE-CLASS-001" },
  { piece: "Bandana", name: "Classic", sku: "BAND-CLASS-001" },
  { piece: "Bucket Hat", name: "Classic", sku: "BUCKET-CLASS-001" },
  { piece: "Wide Brim Sun Hat", name: "Classic", sku: "WBRIM-CLASS-001" },
  { piece: "Wide Brim Sun Hat", name: "Stripes", sku: "WBRIM-STRIP-001" },
  { piece: "Shell Sun Hat", name: "Classic", sku: "SHELL-CLASS-001" },
  { piece: "Shell Sun Hat", name: "Stripes", sku: "SHELL-STRIP-001" },
  {
    piece: "Scallop Edge Bucket Hat",
    name: "Classic",
    sku: "SCALBUCK-CLASS-001",
  },
];

const materialOrders = [
  {
    orderNumber: "MO-2024-001",
    supplier: "Campolmi Florence",
    totalPrice: 2500.0,
    currency: "EUR",
    orderDate: new Date("2024-01-15"),
    expectedDelivery: new Date("2024-02-15"),
    status: OrderStatus.CONFIRMED,
    notes: "Spring/Summer 2024 first order",
  },
  {
    orderNumber: "MO-2024-002",
    supplier: "Campolmi Florence",
    totalPrice: 1800.0,
    currency: "EUR",
    orderDate: new Date("2024-01-20"),
    expectedDelivery: new Date("2024-02-20"),
    status: OrderStatus.PENDING,
    notes: "Additional materials for SS24",
  },
  {
    orderNumber: "MO-2024-003",
    supplier: "Campolmi Florence",
    totalPrice: 3200.0,
    currency: "EUR",
    orderDate: new Date("2024-02-01"),
    expectedDelivery: new Date("2024-03-01"),
    status: OrderStatus.PENDING,
    notes: "Pre-production materials order",
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
  {
    name: "David Lee",
    email: "david.lee@customer.com",
    phone: "+1 (555) 345-6789",
    company: "Fashion Retail Group",
    role: "Buyer",
    type: ContactType.CUSTOMER,
    notes: "Key wholesale customer",
  },
];

async function seed() {
  try {
    // Clear existing data
    await prisma.materialOrderItem.deleteMany();
    await prisma.materialOrder.deleteMany();
    await prisma.productMaterial.deleteMany();
    await prisma.product.deleteMany();
    await prisma.material.deleteMany();
    await prisma.contact.deleteMany();

    console.log("Cleared existing data");

    // Add materials
    const createdMaterials = await Promise.all(
      materials.map((material) =>
        prisma.material.create({
          data: {
            type: "Cotton",
            color: material.color,
            colorCode: material.colorCode,
            brand: "Campolmi",
            quantity: 0.0,
            unit: MeasurementUnit.KILOGRAM,
            costPerUnit: 0.0,
            currency: "EUR",
            location: "Warehouse",
            notes: "30/2x4x4",
            photos: [],
          },
        })
      )
    );

    console.log(`Added ${createdMaterials.length} materials`);

    // Add products
    const createdProducts = await Promise.all(
      products.map((product) =>
        prisma.product.create({
          data: {
            sku: product.sku,
            piece: product.piece,
            name: product.name,
            season: "SS24",
            phase: "SWATCH",
            notes: `Initial creation of ${product.piece} - ${product.name}`,
            photos: [],
          },
        })
      )
    );

    console.log(`Added ${createdProducts.length} products`);

    // Add material orders
    const createdOrders = await Promise.all(
      materialOrders.map((order) =>
        prisma.materialOrder.create({
          data: {
            orderNumber: order.orderNumber,
            supplier: order.supplier,
            totalPrice: order.totalPrice,
            currency: order.currency,
            orderDate: order.orderDate,
            expectedDelivery: order.expectedDelivery,
            status: order.status,
            notes: order.notes,
          },
        })
      )
    );

    console.log(`Added ${createdOrders.length} material orders`);

    // Add contacts
    const createdContacts = await Promise.all(
      contacts.map((contact) =>
        prisma.contact.create({
          data: {
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            company: contact.company,
            role: contact.role,
            type: contact.type,
            notes: contact.notes,
          },
        })
      )
    );

    console.log(`Added ${createdContacts.length} contacts`);

    // Add material order items
    // Create some sample order items for each order
    for (const order of createdOrders) {
      // Add 2-3 items per order with different materials
      const numItems = Math.floor(Math.random() * 2) + 2; // 2-3 items
      for (let i = 0; i < numItems; i++) {
        const material =
          createdMaterials[Math.floor(Math.random() * createdMaterials.length)];
        const quantity = Math.floor(Math.random() * 50) + 10; // 10-60 units
        const unitPrice = Math.random() * 20 + 10; // 10-30 per unit

        await prisma.materialOrderItem.create({
          data: {
            orderId: order.id,
            materialId: material.id,
            quantity: quantity,
            unit: MeasurementUnit.KILOGRAM,
            unitPrice: unitPrice,
            totalPrice: quantity * unitPrice,
            notes: `Order item for ${material.color}`,
          },
        });
      }
    }

    console.log("Added material order items");

    // Create some product-material relationships
    await prisma.productMaterial.create({
      data: {
        productId: createdProducts[0].id,
        materialId: createdMaterials[0].id,
        quantity: 1.0,
        unit: MeasurementUnit.KILOGRAM,
        notes: "Main material",
      },
    });

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

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

