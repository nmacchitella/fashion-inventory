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
