'use client'

import { useCallback, useEffect, useState } from "react"
import { FormSchema } from "@/types/form"
import { FormSections } from "./FormSections"
import { FormPreview } from "./FormPreview"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface FormBuilderProps {
  initialData?: FormSchema
  onSave: (data: FormSchema) => Promise<void>
  isLoading?: boolean
}

/**
 * FormBuilder component for creating and editing form templates
 * @param {FormBuilderProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function FormBuilder({
  initialData,
  onSave,
  isLoading = false,
}: FormBuilderProps) {
  const [activeTab, setActiveTab] = useState("editor")
  const [formData, setFormData] = useState<FormSchema>(
    initialData || {
      sections: [],
      metadata: {
        title: "",
        description: "",
      },
    }
  )

  const handleSave = useCallback(async () => {
    try {
      await onSave(formData)
      toast.success("Form saved successfully")
    } catch (error) {
      console.error("Failed to save form:", error)
      toast.error("Failed to save form")
    }
  }, [formData, onSave])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSave])

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          aria-label="Save form template"
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="flex-1">
        <TabsContent value="editor" className="h-full">
          <FormSections
            sections={formData.sections}
            onChange={(sections) =>
              setFormData((prev) => ({ ...prev, sections }))
            }
            disabled={isLoading}
          />
        </TabsContent>
        <TabsContent value="preview" className="h-full">
          <FormPreview
            sections={formData.sections}
            metadata={formData.metadata}
          />
        </TabsContent>
      </div>
    </div>
  )
} 