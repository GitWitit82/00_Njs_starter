"use client"

import { useRouter } from "next/navigation"
import { FormTemplateBuilder } from "@/components/forms/form-template-builder"
import { FormType } from "@prisma/client"
import { toast } from "sonner"

/**
 * Form Builder Page
 * Allows users to create new form templates
 */
export default function FormBuilderPage() {
  const router = useRouter()

  const handleSubmit = async (data: {
    name: string
    description?: string
    type: FormType
    schema: {
      fields: Array<{
        id: string
        type: string
        label: string
        placeholder?: string
        required?: boolean
      }>
    }
  }) => {
    try {
      const response = await fetch("/api/forms/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create form template")
      }

      const template = await response.json()
      toast.success("Form template created successfully")
      router.push(`/forms/templates/${template.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create Form Template</h1>
        <FormTemplateBuilder onSubmit={handleSubmit} />
      </div>
    </div>
  )
} 