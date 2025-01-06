"use client"

import { FormTemplate } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import { Edit, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface FormTemplateListProps {
  templates: (FormTemplate & {
    department: { id: string; name: string; color: string } | null
  })[]
  onEdit: (template: FormTemplate) => void
  onDelete: (template: FormTemplate) => void
}

export function FormTemplateList({
  templates,
  onEdit,
  onDelete,
}: FormTemplateListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No form templates found. Click the button above to create one.
            </TableCell>
          </TableRow>
        ) : (
          templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell>{template.description}</TableCell>
              <TableCell>
                {template.department ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: template.department.color }}
                    />
                    <span className="text-sm">{template.department.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No department</span>
                )}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(template.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(template)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
} 