"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StandardChecklist } from "./StandardChecklist"

interface FormTemplateListProps {
  templates: any[]
  onEdit?: (template: any) => void
  onDelete?: (template: any) => void
}

/**
 * Form template list component with preview functionality
 */
export function FormTemplateList({
  templates,
  onEdit,
  onDelete,
}: FormTemplateListProps) {
  const router = useRouter()
  const [previewTemplate, setPreviewTemplate] = useState<any>(null)

  const handlePreview = (template: any) => {
    setPreviewTemplate(template)
  }

  const handleClosePreview = () => {
    setPreviewTemplate(null)
  }

  const renderPreview = () => {
    if (!previewTemplate) return null

    // For checklist type forms
    if (previewTemplate.type === "CHECKLIST") {
      const tasks = previewTemplate.schema.sections[0]?.fields.map((field: any) => ({
        id: field.id,
        text: field.label,
        isCompleted: false
      })) || []

      return (
        <StandardChecklist
          title={previewTemplate.name}
          departmentColor={previewTemplate.department?.color}
          description={previewTemplate.description}
          tasks={tasks}
          projectDetails={{
            enabled: true,
            fields: [
              { id: "client", label: "Client", type: "text" },
              { id: "project", label: "Project", type: "text" },
              { id: "date", label: "Date", type: "date" },
              { id: "vinNumber", label: "VIN Number", type: "text" },
              { id: "invoice", label: "Invoice#", type: "text" }
            ]
          }}
        />
      )
    }

    // For other form types, show a message
    return (
      <div className="p-4 text-center text-gray-500">
        Preview not available for this form type yet
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Phase</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell>{template.name}</TableCell>
              <TableCell>{template.type}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: template.department?.color }}
                  />
                  {template.department?.name}
                </div>
              </TableCell>
              <TableCell>{template.phase?.name}</TableCell>
              <TableCell>v{template.currentVersion}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(template)}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(template)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(template)}
                    className="text-red-500"
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!previewTemplate} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Preview</DialogTitle>
          </DialogHeader>
          {renderPreview()}
        </DialogContent>
      </Dialog>
    </>
  )
} 