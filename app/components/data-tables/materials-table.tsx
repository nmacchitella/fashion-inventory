"use client"

import { useState } from "react";
import { Material } from "@/types/material"
import { DataTableRowActions } from "@/components/ui/data-table-row-actions"
import { useRouter } from "next/navigation"
import { DialogComponent } from "@/components/ui/dialog"
import { MaterialEditForm } from "@/components/forms/material-edit-form"

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
  }
];

export function MaterialsTable({ materials: initialMaterials }: { materials: Material[] }) {
  const router = useRouter();
  const [materials, setMaterials] = useState(initialMaterials);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (updatedMaterial: Partial<Material>) => {
    if (!selectedMaterial) return;

    try {
      const response = await fetch(`/api/materials/${selectedMaterial.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMaterial),
      });

      if (!response.ok) {
        throw new Error('Failed to update material');
      }

      const updated = await response.json();
      
      // Update the local state with the new data
      setMaterials(materials.map(m => 
        m.id === updated.id ? updated : m
      ));
      
      setIsEditDialogOpen(false);
      setSelectedMaterial(null);
    } catch (error) {
      console.error('Error updating material:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedMaterial) return;

    try {
      const response = await fetch(`/api/materials/${selectedMaterial.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete material");
      }

      // Update local state by removing the deleted material
      setMaterials(materials.filter(m => m.id !== selectedMaterial.id));
      setIsEditDialogOpen(false);
      setSelectedMaterial(null);
      router.refresh(); // Refresh the page data
    } catch (error) {
      console.error("Error deleting material:", error);
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
                    onView={() => router.push(`/inventory/materials/${material.id}`)}
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
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedMaterial(null);
            }}
          />
        </DialogComponent>
      )}
    </>
  );
}