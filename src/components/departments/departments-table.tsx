"use client"

import { Department } from "@prisma/client"
import { Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DepartmentsTableProps {
  departments: Department[]
  isLoading: boolean
  onEdit: (department: Department) => void
  onDelete: (id: string) => void
}

export function DepartmentsTable({
  departments,
  isLoading,
  onEdit,
  onDelete,
}: DepartmentsTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading departments...</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we fetch the department data.
          </p>
        </div>
      </div>
    )
  }

  if (!departments.length) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No departments found</h2>
          <p className="text-sm text-muted-foreground">
            Create a new department to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Color</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {departments.map((department) => (
          <TableRow key={department.id}>
            <TableCell>
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: department.color }}
              />
            </TableCell>
            <TableCell className="font-medium">{department.name}</TableCell>
            <TableCell>{department.description}</TableCell>
            <TableCell>
              {new Date(department.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(department)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(department.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 