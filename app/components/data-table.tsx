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
  viewPath: string; // The base path for viewing details (e.g., "/contacts", "/materials")
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