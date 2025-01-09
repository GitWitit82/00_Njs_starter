"use client"

import { FormTemplate, Department } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { Edit2Icon, EyeIcon, Trash2Icon } from "lucide-react"

interface FormTemplateWithDepartment extends FormTemplate {
  department: Pick<Department, "id" | "name" | "color"> | null
}

interface FormTemplateListProps {
  templates: FormTemplateWithDepartment[]
  onEdit: (template: FormTemplate) => void
  onDelete: (template: FormTemplate) => void
  onPreview: (template: FormTemplate) => void
}

/**
 * Displays a list of form templates with actions
 */
export function FormTemplateList({
  templates,
  onEdit,
  onDelete,
  onPreview
}: FormTemplateListProps) {
  return (
    <Card>
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: template.department?.color }}
                    />
                    {template.department?.name || "No Department"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {template.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={template.isActive ? "default" : "secondary"}
                  >
                    {template.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onPreview(template)}
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span className="sr-only">Preview</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(template)}
                    >
                      <Edit2Icon className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(template)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2Icon className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {templates.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No form templates found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
} 