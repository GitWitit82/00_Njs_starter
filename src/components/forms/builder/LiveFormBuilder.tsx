'use client'

import { useState } from "react"
import { FormTemplate } from "@/lib/validations/form"
import { Department, FormPriority, FormType } from "@prisma/client"
import { FormSections } from "./FormSections"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface LiveFormBuilderProps {
  template: FormTemplate
  departments?: Department[]
  onSave: (template: FormTemplate) => Promise<void>
  onPublish?: () => Promise<void>
  isPublished?: boolean
}

export function LiveFormBuilder({
  template,
  departments,
  onSave,
  onPublish,
  isPublished,
}: LiveFormBuilderProps) {
  const [formData, setFormData] = useState<FormTemplate>(template)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSave(formData)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!onPublish) return
    try {
      setIsPublishing(true)
      await onPublish()
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Label htmlFor="form-name">Form Name</Label>
          <Input
            id="form-name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            aria-label="Form name"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            aria-label={isSaving ? "Saving form" : "Save form"}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
          {onPublish && (
            <Button
              onClick={handlePublish}
              disabled={isPublishing || isPublished}
              aria-label={
                isPublishing
                  ? "Publishing form"
                  : isPublished
                  ? "Form is published"
                  : "Publish form"
              }
            >
              {isPublishing
                ? "Publishing..."
                : isPublished
                ? "Published"
                : "Publish"}
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="form-type">Form Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: FormType) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger id="form-type">
                <SelectValue placeholder="Select form type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STANDARD">Standard</SelectItem>
                <SelectItem value="FORM">Form</SelectItem>
                <SelectItem value="CHECKLIST">Checklist</SelectItem>
                <SelectItem value="SURVEY">Survey</SelectItem>
                <SelectItem value="INSPECTION">Inspection</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: FormPriority) =>
                setFormData((prev) => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger id="form-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STANDARD">Standard</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="OPTIONAL">Optional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="form-description">Description</Label>
          <Textarea
            id="form-description"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Enter form description"
            aria-label="Form description"
          />
        </div>
        {departments && (
          <div className="space-y-2">
            <Label htmlFor="form-department">Department</Label>
            <Select
              value={formData.departmentId || ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  departmentId: value || undefined,
                }))
              }
            >
              <SelectTrigger id="form-department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <FormSections
        sections={formData.schema.sections}
        onChange={(sections) =>
          setFormData((prev) => ({
            ...prev,
            schema: { ...prev.schema, sections },
          }))
        }
      />
    </div>
  )
} 