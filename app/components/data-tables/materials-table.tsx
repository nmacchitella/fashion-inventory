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

  // const handleDelete = async () => {
  //   if (!selectedMaterial) return;

  //   try {
  //     const response = await fetch(`/api/materials/${selectedMaterial.id}`, {
  //       method: "DELETE",
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to delete material");
  //     }

  //     // Call the onDelete callback if provided
  //     if (onDelete) {
  //       onDelete(selectedMaterial.id);
  //     }

  //     setIsEditDialogOpen(false);
  //     setSelectedMaterial(null);
  //   } catch (error) {
  //     console.error("Error deleting material:", error);
  //   }
  // };

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
