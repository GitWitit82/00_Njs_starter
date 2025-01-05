import { useState } from "react"
import { FormTemplate } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FormField } from "./FormField"
import { FormSection } from "./FormSection"
import { FormPreview } from "./FormPreview"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface FormBuilderProps {
  initialTemplate?: Partial<FormTemplate>
  onSave: (template: Partial<FormTemplate>) => Promise<void>
  className?: string
}

/**
 * FormBuilder component for creating and editing form templates
 * Supports multiple form types, layouts, and custom dynamic forms
 */
export function FormBuilder({ initialTemplate, onSave, className }: FormBuilderProps) {
  const { toast } = useToast()
  const [template, setTemplate] = useState<Partial<FormTemplate>>(
    initialTemplate || {
      name: "",
      description: "",
      type: "FORM",
      schema: {
        fields: [],
        sections: [],
        layout: { type: "default" },
      },
      layout: {},
      style: {},
      metadata: {},
    }
  )
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")

  /**
   * Adds a new field to the form template
   */
  const handleAddField = (field: any) => {
    setTemplate((prev) => ({
      ...prev,
      schema: {
        ...prev.schema,
        fields: [...(prev.schema?.fields || []), field],
      },
    }))
  }

  /**
   * Adds a new section to the form template
   */
  const handleAddSection = (section: any) => {
    setTemplate((prev) => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: [...(prev.schema?.sections || []), section],
      },
    }))
  }

  /**
   * Updates the form template layout
   */
  const handleUpdateLayout = (layout: any) => {
    setTemplate((prev) => ({
      ...prev,
      layout,
    }))
  }

  /**
   * Handles saving the form template
   */
  const handleSave = async () => {
    try {
      await onSave(template)
      toast({
        title: "Success",
        description: "Form template saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save form template",
        variant: "destructive",
      })
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="space-x-2">
          <Button
            variant={activeTab === "edit" ? "default" : "outline"}
            onClick={() => setActiveTab("edit")}
          >
            Edit
          </Button>
          <Button
            variant={activeTab === "preview" ? "default" : "outline"}
            onClick={() => setActiveTab("preview")}
          >
            Preview
          </Button>
        </div>
        <Button onClick={handleSave}>Save Template</Button>
      </div>

      <Card className="p-4">
        {activeTab === "edit" ? (
          <div className="space-y-6">
            {/* Form Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Form Settings</h3>
              <FormField
                type="text"
                label="Name"
                value={template.name}
                onChange={(value) => setTemplate((prev) => ({ ...prev, name: value }))}
              />
              <FormField
                type="textarea"
                label="Description"
                value={template.description}
                onChange={(value) => setTemplate((prev) => ({ ...prev, description: value }))}
              />
              <FormField
                type="select"
                label="Type"
                value={template.type}
                options={[
                  { label: "Form", value: "FORM" },
                  { label: "Checklist", value: "CHECKLIST" },
                  { label: "Custom", value: "CUSTOM" },
                ]}
                onChange={(value) => setTemplate((prev) => ({ ...prev, type: value }))}
              />
            </div>

            {/* Fields and Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Fields and Sections</h3>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => handleAddField({
                    id: crypto.randomUUID(),
                    type: "TEXT",
                    label: "New Field",
                  })}>
                    Add Field
                  </Button>
                  <Button variant="outline" onClick={() => handleAddSection({
                    id: crypto.randomUUID(),
                    title: "New Section",
                    fields: [],
                  })}>
                    Add Section
                  </Button>
                </div>
              </div>

              {template.schema?.sections?.map((section) => (
                <FormSection
                  key={section.id}
                  section={section}
                  fields={template.schema?.fields || []}
                  onUpdate={(updatedSection) => {
                    setTemplate((prev) => ({
                      ...prev,
                      schema: {
                        ...prev.schema,
                        sections: prev.schema?.sections?.map((s) =>
                          s.id === section.id ? updatedSection : s
                        ),
                      },
                    }))
                  }}
                  onDelete={() => {
                    setTemplate((prev) => ({
                      ...prev,
                      schema: {
                        ...prev.schema,
                        sections: prev.schema?.sections?.filter((s) => s.id !== section.id),
                      },
                    }))
                  }}
                />
              ))}

              {template.schema?.fields?.map((field) => (
                <FormField
                  key={field.id}
                  {...field}
                  onUpdate={(updatedField) => {
                    setTemplate((prev) => ({
                      ...prev,
                      schema: {
                        ...prev.schema,
                        fields: prev.schema?.fields?.map((f) =>
                          f.id === field.id ? updatedField : f
                        ),
                      },
                    }))
                  }}
                  onDelete={() => {
                    setTemplate((prev) => ({
                      ...prev,
                      schema: {
                        ...prev.schema,
                        fields: prev.schema?.fields?.filter((f) => f.id !== field.id),
                      },
                    }))
                  }}
                />
              ))}
            </div>

            {/* Layout Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Layout Settings</h3>
              <FormField
                type="select"
                label="Layout Type"
                value={template.layout?.type}
                options={[
                  { label: "Default", value: "default" },
                  { label: "Sections", value: "sections" },
                  { label: "Grid", value: "grid" },
                  { label: "Custom", value: "custom" },
                ]}
                onChange={(value) => handleUpdateLayout({ ...template.layout, type: value })}
              />
              {template.layout?.type === "grid" && (
                <FormField
                  type="number"
                  label="Columns"
                  value={template.layout?.config?.columns}
                  onChange={(value) =>
                    handleUpdateLayout({
                      ...template.layout,
                      config: { ...template.layout?.config, columns: parseInt(value) },
                    })
                  }
                />
              )}
            </div>
          </div>
        ) : (
          <FormPreview template={template} />
        )}
      </Card>
    </div>
  )
} 