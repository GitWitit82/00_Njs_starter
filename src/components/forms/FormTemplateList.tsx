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
import { StandardFormTemplate } from "./StandardFormTemplate"
import { StandardChecklist } from "./StandardChecklist"

interface FormTemplateListProps {
  templates: any[]
  onEdit?: (templateId: string) => void
  onDelete?: (templateId: string) => void
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

    if (previewTemplate.type === "CHECKLIST") {
      return (
        <StandardChecklist
          title={previewTemplate.name}
          departmentColor={previewTemplate.department?.color}
          description={previewTemplate.description}
          tasks={previewTemplate.schema.sections[0]?.fields.map((field: any) => ({
            id: field.id,
            text: field.label,
            isCompleted: false,
          }))}
        />
      )
    }

    return (
      <StandardFormTemplate
        title={previewTemplate.name}
        departmentColor={previewTemplate.department?.color}
        description={previewTemplate.description}
      >
        {previewTemplate.schema.sections.map((section: any) => (
          <div key={section.id} className="space-y-4">
            <h3 className="text-lg font-medium">{section.title}</h3>
            <div className="space-y-2">
              {section.fields.map((field: any) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    disabled
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </StandardFormTemplate>
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
                    onClick={() => onEdit?.(template.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete?.(template.id)}
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Form Preview</DialogTitle>
          </DialogHeader>
          {renderPreview()}
        </DialogContent>
      </Dialog>
    </>
  )
} 