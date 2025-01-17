"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FormSchema } from "@/types/forms"
import { FormBuilder } from "@/components/forms/builder/FormBuilder"

interface FormTemplatesWrapperProps {
  templateId: string
  initialData: FormSchema | null
}

interface SaveFormData {
  schema: FormSchema
  notes: string
}

/**
 * FormTemplatesWrapper component for managing form template creation and editing
 * @param {FormTemplatesWrapperProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function FormTemplatesWrapper({
  templateId,
  initialData,
}: FormTemplatesWrapperProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async (data: SaveFormData) => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/forms/templates/${templateId}/versions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to save form template")
      }

      toast.success("Form template saved successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to save form template")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormBuilder
      templateId={templateId}
      initialData={initialData}
      onSave={handleSave}
      isLoading={isLoading}
    />
  )
} 