"use client";

import { DataTable, type DataTableColumn } from "@/components/data-table";
import { UpsertDialog } from "@/components/forms/upsert-dialog"; // Our generic create/edit dialog
import { BackButton } from "@/components/ui/back-button";
import { DetailsView } from "@/components/ui/details-view";
import { DialogComponent } from "@/components/ui/dialog";
import { Inventory, Material } from "@/types/types";
import { Plus } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

const materialFields = [
  { key: "type", label: "Type", type: "text", required: true },
  { key: "color", label: "Color", type: "text" },
  { key: "colorCode", label: "Color Code", type: "text" },
  { key: "brand", label: "Brand", type: "text" },
  { key: "quantity", label: "Quantity", type: "number" },
  { key: "unit", label: "Unit", type: "text" },
  { key: "costPerUnit", label: "Cost Per Unit", type: "number" },
  { key: "currency", label: "Currency", type: "text" },
  { key: "location", label: "Location", type: "text" },
  { key: "Properties", label: "Properties", type: "textarea" },
];

// Fetch the material from the API:
async function fetchMaterial(materialId: string) {
  try {
    const response = await fetch(`/api/materials/${materialId}`);
    if (response.status === 404) {
      notFound();
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching material:", error);
    throw error;
  }
}

export default function MaterialPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params); // Resolve the promise for the 'materialId'
  const [material, setMaterial] = useState<Material | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Load material when the page mounts or materialId changes
  useEffect(() => {
    fetchMaterial(resolvedParams.materialId).then(setMaterial);
  }, [resolvedParams.materialId]);

  if (!material) {
    return <div>Loading...</div>;
  }

  // Prepare detail items for <DetailsView>
  console.log(material);
  const detailItems = [
    {
      label: "Brand",
      value: material.brand, // Make sure this is a string
      key: "brand",
      editable: true,
    },
    {
      label: "Type",
      value: material.type, // Make sure this is a string
      key: "type",
      editable: true,
    },
    {
      label: "Cost Per Unit",
      value: material.defaultCostPerUnit, // This should be a number
      key: "costPerUnit",
      type: "number",
      editable: true,
    },
  ];

  // -- Column definitions --

  const inventoryColumns: DataTableColumn<Inventory>[] = [
    {
      header: "Quantity",
      accessorKey: "quantity",
      cell: (inventory) => `${inventory.quantity} ${inventory.unit}`,
    },
    { header: "Location", accessorKey: "location" },
  ];

  const productsColumns: DataTableColumn<Inventory>[] = [
    {
      header: "Model",
      accessorKey: "name",
      cell: (product) => `${product.product.name}`,
    },
    {
      header: "Season",
      accessorKey: "season",
      cell: (product) => `${product.product.season}`,
    },
  ];

  // Called after a successful PATCH (edit):
  const handleSaveSuccess = (updatedMaterial: Material) => {
    setMaterial(updatedMaterial);
    setIsEditDialogOpen(false);
  };

  // Called when the user clicks Delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/materials/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete material");
      }
      // Go back to the materials list
      router.push("/inventory/materials");
      router.refresh();
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {material.colorCode} - {material.color}
          </h1>
          <div className="flex gap-2">
            {/* <button
              onClick={() => setIsEditDialogOpen(true)}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Edit
            </button> */}
            <BackButton />
          </div>
        </div>

        <DetailsView
          title=""
          items={detailItems}
          apiEndpoint="/api/materials"
          itemId={material.id}
        />
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <div className="">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-1xl font-bold">Inventory</h2>
            <button
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Add new inventory item"
              // onClick={() => console.log("Add new inventory clicked")}
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <DataTable
            data={material.inventory}
            columns={inventoryColumns}
            viewPath="/inventory" // Assuming the details path for inventory items
          />
        </div>
        <div className="">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-1xl font-bold">Product</h2>
            <button
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Add new inventory item"
              onClick={() => console.log("Add new inventory clicked")}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <DataTable
            data={material.products}
            columns={productsColumns}
            viewPath="/inventory" // Assuming the details path for inventory items
          />
        </div>
      </div>

      {/* Our UpsertDialog for editing the material */}
      {isEditDialogOpen && (
        <DialogComponent
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Edit Material"
        >
          <UpsertDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={handleSaveSuccess}
            defaultData={material}
            fields={materialFields}
            apiEndpoint="/api/materials"
            itemName="Material"
            mode="edit"
            onDeleteSuccess={(item) => handleDelete(item.id!)}
          />
        </DialogComponent>
      )}
    </>
  );
}
