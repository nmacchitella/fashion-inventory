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
