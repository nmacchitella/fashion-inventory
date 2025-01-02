"use client";

import { DataTable, type DataTableColumn } from "@/components/data-table";
import MaterialSelector from "@/components/forms/product-material-selector";
import { UpsertDialog } from "@/components/forms/upsert-dialog"; // or your renamed component
import { Notes } from "@/components/notes";
import { DetailsView } from "@/components/ui/details-view";
import { DialogComponent } from "@/components/ui/dialog";
import { Inventory, Product } from "@/types/types";
import { Plus } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

// Example of the same product form fields you used in ProductsControls:
export const inventoryFields = [
  {
    key: "quantity",
    label: "Quantity",
    type: "number",
    required: true,
  },
  {
    key: "unit",
    label: "Unit",
    type: "select",
    options: [{ label: "Unit", value: "UNIT" }],
    required: true,
  },
  {
    key: "location",
    label: "Location",
    type: "text",
  },
  {
    key: "notes",
    label: "Notes",
    type: "textarea",
  },
  // Optionally, if you're providing productId via form (often it’s just included in the request automatically):
  // {
  //   key: "productId",
  //   label: "Product ID",
  //   type: "hidden",
  //   defaultValue: someProductId,
  // },
];

export const materialFields = [
  {
    key: "type",
    label: "Material Type",
    type: "text", // or 'select' if you have predefined categories
    required: true,
  },
  {
    key: "color",
    label: "Color",
    type: "text",
  },
  {
    key: "colorCode",
    label: "Color Code",
    type: "text",
  },
  {
    key: "brand",
    label: "Brand",
    type: "text",
  },
  {
    key: "defaultUnit",
    label: "Default Unit",
    type: "select",
    options: [
      { label: "Gram", value: "GRAM" },
      { label: "Kilogram", value: "KILOGRAM" },
      { label: "Meter", value: "METER" },
      { label: "Yard", value: "YARD" },
      { label: "Unit", value: "UNIT" },
    ],
  },
  {
    key: "defaultCostPerUnit",
    label: "Cost per Unit",
    type: "number",
  },
  {
    key: "currency",
    label: "Currency",
    type: "text",
    // Or use a dropdown of known currencies, e.g. 'USD', 'EUR', etc.
  },
  {
    key: "properties",
    label: "Properties (JSON)",
    type: "textarea",
    // If you want a friendlier UI, you might implement a structured editor
  },
  {
    key: "notes",
    label: "Notes",
    type: "textarea",
  },
];

async function fetchProduct(productId: string) {
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
  // In Next 13+ (app router), we "resolve" the promise from `params`:
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(
    null
  );

  // Whether we show the edit dialog
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    item?: "Inventory" | "Material";
    mode?: "create" | "edit";
  }>({ open: false });

  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);

  // Load the product data on mount or when productId changes
  useEffect(() => {
    fetchProduct(resolvedParams.productId).then(setProduct);
  }, [resolvedParams.productId]);

  // If we're still loading, show a placeholder
  if (!product) {
    return <div>Loading...</div>;
  }

  // PHASE color styling (same helper as before)
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

  // Items for our DetailsView
  const detailItems = [
    { label: "SKU", value: product.sku, key: "sku", editable: true },
    { label: "Piece", value: product.piece, key: "piece", editable: true },
    { label: "Name", value: product.name, key: "name", editable: true },
    { label: "Season", value: product.season, key: "season", editable: true },
    {
      label: "Phase",
      value: product.phase,
      key: "phase",
      editable: true,
    },
  ];

  const inventoryColumns: DataTableColumn<Inventory>[] = [
    {
      header: "Quantity",
      accessorKey: "quantity",
      cell: (inventory) => `${inventory.quantity} ${inventory.unit}`,
    },
    { header: "Location", accessorKey: "location" },
  ];

  const materialColumns: DataTableColumn<Inventory>[] = [
    {
      header: "Brand",
      accessorKey: "brand",
      cell: (material) => `${material?.material.brand}`,
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (material) => `${material?.material.type}`,
    },
    {
      header: "Color",
      accessorKey: "color",
      cell: (material) =>
        `${material?.material.colorCode} ${material?.material.color}`,
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
      cell: (material) => `${material?.quantity} ${material?.unit}`,
    },
  ];

  // -- Updating product via PATCH
  const handleSaveSuccess = async (updated: Product) => {
    // Merge new data into state
    setProduct(updated);
    // Close dialog
    setDialogState({ open: false });
  };

  const handleSaveInventorySuccess = (newInventory: Inventory) => {
    if (!product) return;

    const updatedInventory = product.inventory.find(
      (i) => i.id === newInventory.id
    )
      ? product.inventory.map((i) =>
          i.id === newInventory.id ? newInventory : i
        )
      : [...product.inventory, newInventory];

    setProduct({
      ...product,
      inventory: updatedInventory,
    });
    setDialogState({ open: false });
  };

  const handleAddMaterial = () => {
    setDialogState({ open: true, item: "Material", mode: "create" });
  };

  const handleAddInventory = () => {
    setDialogState({ open: true, item: "Inventory", mode: "create" });
  };

  const handleEditInventory = (inventory: Inventory) => {
    setDialogState({ open: true, item: "Inventory", mode: "edit" });
    setSelectedInventory(inventory);
    return;
  };
  // -- Deleting the product
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      // If success, navigate away
      router.push("/inventory/products");
      router.refresh();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // E.g. a little helper that returns the correct props for each mode:
  function getDialogProps(item: string | undefined) {
    switch (item) {
      // case "Product":
      //   return {
      //     title: "Product",
      //     // If you’re using UpsertDialog:
      //     fields: productFields,
      //     defaultData: product,
      //     apiEndpoint: "/api/products",
      //     itemName: "Product",
      //     method: "PATCH",
      //   };
      case "Material":
        return {
          title: "Material",
          fields: materialFields,
          defaultData: {}, // or something
          apiEndpoint: "/api/materials",
          itemName: "Material",
          method: "POST",
        };
      case "Inventory":
        return {
          title: "Inventory",
          fields: inventoryFields,
          defaultData: {
            ...selectedInventory,
            unit: "UNIT",
            type: "PRODUCT",
            productId: product.id,
          },
          apiEndpoint: "/api/inventory",
          itemName: "Inventory",
          method: "POST",
          onSuccess: handleSaveInventorySuccess,
        };
      default:
        return {
          title: "",
          fields: [],
          defaultData: {},
          apiEndpoint: "",
          itemName: "",
          method: "POST",
        };
    }
  }

  const handleMaterialSelect = async (data) => {
    await fetch(`/api/products/${product.id}/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    // Refresh product data
    fetchProduct(product.id).then(setProduct);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold"></h1>
        </div>
        <DetailsView
          title={product.name}
          onSave={handleSaveSuccess}
          items={detailItems}
          apiEndpoint="/api/products"
          itemId={product.id}
          allowCustomFields={false} // Enable custom fields for materials
        />
      </div>
      <div className="mt-2">
        <Notes
          initialNotes={product.notes}
          onSuccess={handleSaveSuccess}
          apiEndpoint="/api/products"
          itemId={product.id}
        />
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <div className="">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-1xl font-bold">Materials Needed</h2>
            <button
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Add new material"
              onClick={() => setMaterialDialogOpen(true)}
            >
              <Plus className="w-5 h-5" />
            </button>
            {materialDialogOpen && (
              <MaterialSelector
                productId={product.id}
                onSelect={handleMaterialSelect}
                open={materialDialogOpen}
                onOpenChange={setMaterialDialogOpen}
                fields={materialFields}
              />
            )}
          </div>

          <DataTable
            data={product.materials}
            columns={materialColumns}
            viewPath="/inventory"
          />
        </div>
        <div className="">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-1xl font-bold">Inventory</h2>
            <button
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Add new inventory item"
              onClick={handleAddInventory}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <DataTable
            data={product.inventory}
            columns={inventoryColumns}
            viewPath="/inventory"
            onUpdate={handleEditInventory}
          />
        </div>
      </div>

      {/* Edit dialog: reuse UpsertDialog (or your custom product dialog) */}
      {dialogState.open && (
        <DialogComponent
          open={dialogState.open}
          onOpenChange={setDialogState}
          title={getDialogProps(dialogState.item).title}
        >
          <UpsertDialog
            // Tell it we’re editing, not creating
            mode={dialogState.mode}
            open={dialogState.open}
            onOpenChange={(isOpen) =>
              setDialogState((prev) => ({ ...prev, open: isOpen }))
            }
            // onSuccess={handleSaveSuccess}
            onDeleteSuccess={handleDelete}
            {...getDialogProps(dialogState.item)}
          />
        </DialogComponent>
      )}
    </>
  );
}
