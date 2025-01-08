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
import { PrintChecklistForm } from "./PrintChecklistForm"

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

    // For print checklist form type
    if (previewTemplate.name.toLowerCase().includes('print checklist') || 
        previewTemplate.type === "CHECKLIST") {
      return (
        <PrintChecklistForm 
          departmentColor={previewTemplate.department?.color || "#004B93"} 
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
              <TableCell>{template.department?.name}</TableCell>
              <TableCell>{template.phase?.name}</TableCell>
              <TableCell>v{template.currentVersion}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(template)}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(template)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete?.(template)}
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