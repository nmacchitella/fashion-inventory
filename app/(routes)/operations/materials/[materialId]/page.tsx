"use client";

import { UpsertDialog } from "@/components/forms/upsert-dialog"; // Our generic create/edit dialog
import { BackButton } from "@/components/ui/back-button";
import { DetailsView } from "@/components/ui/details-view";
import { DialogComponent } from "@/components/ui/dialog";
import { Material } from "@/types/types";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

// Example form fields for a Material
// Adapt these to match your Material schema
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
  { key: "notes", label: "Notes", type: "textarea" },
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
