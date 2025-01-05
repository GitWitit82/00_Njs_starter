import { useState } from "react"
import { FormTemplate } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FormField } from "./FormField"
import { cn } from "@/lib/utils"

interface FormPreviewProps {
  template: Partial<FormTemplate>
  initialData?: Record<string, any>
  onSubmit?: (data: Record<string, any>) => Promise<void>
  className?: string
}

/**
 * FormPreview component for rendering and interacting with form templates
 * Supports all field types, layouts, and custom dynamic forms
 */
export function FormPreview({
  template,
  initialData = {},
  onSubmit,
  className,
}: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Updates form data when a field value changes
   */
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  /**
   * Handles form submission
   */
  const handleSubmit = async () => {
    if (!onSubmit) return

    try {
      setIsSubmitting(true)
      await onSubmit(formData)
    } catch (error) {
      console.error("Form submission failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Renders fields based on the template layout
   */
  const renderFields = () => {
    const { schema, layout } = template

    if (!schema?.fields) return null

    // If using sections layout
    if (layout?.type === "sections" && schema.sections?.length) {
      return schema.sections.map((section) => (
        <Card key={section.id} className="p-4 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">{section.title}</h3>
            {section.description && (
              <p className="text-sm text-gray-500">{section.description}</p>
            )}
          </div>
          <div className={getLayoutClass(layout)}>
            {section.fields.map((fieldId) => {
              const field = schema.fields?.find((f) => f.id === fieldId)
              if (!field) return null

              return (
                <FormField
                  key={fieldId}
                  {...field}
                  value={formData[fieldId]}
                  onChange={(value) => handleFieldChange(fieldId, value)}
                />
              )
            })}
          </div>
        </Card>
      ))
    }

    // If using grid layout
    if (layout?.type === "grid") {
      return (
        <div className={getLayoutClass(layout)}>
          {schema.fields.map((field) => (
            <FormField
              key={field.id}
              {...field}
              value={formData[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
            />
          ))}
        </div>
      )
    }

    // Default layout
    return (
      <div className="space-y-4">
        {schema.fields.map((field) => (
          <FormField
            key={field.id}
            {...field}
            value={formData[field.id]}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        ))}
      </div>
    )
  }

  /**
   * Gets the CSS class for the layout type
   */
  const getLayoutClass = (layout: any) => {
    switch (layout?.type) {
      case "grid":
        return cn(
          "grid gap-4",
          layout.config?.columns === 2 && "grid-cols-2",
          layout.config?.columns === 3 && "grid-cols-3",
          layout.config?.columns === 4 && "grid-cols-4"
        )
      default:
        return "space-y-4"
    }
  }

  /**
   * Validates if the form can be submitted
   */
  const canSubmit = () => {
    if (!template.schema?.fields) return false

    return template.schema.fields.every((field) => {
      if (field.required) {
        const value = formData[field.id]
        return value !== undefined && value !== "" && value !== null
      }
      return true
    })
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Form Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{template.name}</h2>
        {template.description && (
          <p className="text-gray-500">{template.description}</p>
        )}
      </div>

      {/* Form Fields */}
      {renderFields()}

      {/* Form Actions */}
      {onSubmit && (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setFormData(initialData)}
          >
            Reset
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit() || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      )}
    </div>
  )
} 