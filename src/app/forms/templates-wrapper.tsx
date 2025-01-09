"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { FormTemplate, Department } from "@prisma/client"
import { FormTemplateList } from "@/components/forms/templates/FormTemplateList"

interface FormTemplateWithDepartment extends FormTemplate {
  department: Pick<Department, "id" | "name" | "color"> | null
}

interface FormTemplateListWrapperProps {
  templates: FormTemplateWithDepartment[]
}

/**
 * Client-side wrapper for form template list
 * Handles template management operations (edit/delete/preview)
 */
export function FormTemplateListWrapper({
  templates,
}: FormTemplateListWrapperProps) {
  const router = useRouter()
  const { toast } = useToast()

  /**
   * Navigate to template edit page
   */
  const handleEdit = (template: FormTemplate) => {
    router.push(`/forms/templates/${template.id}`)
  }

  /**
   * Navigate to template preview page
   */
  const handlePreview = (template: FormTemplate) => {
    router.push(`/forms/templates/${template.id}/preview`)
  }

  /**
   * Delete a form template
   */
  const handleDelete = async (template: FormTemplate) => {
    if (!template?.id) {
      toast({
        title: "Error",
        description: "Invalid template ID",
        variant: "destructive",
      })
      return
    }

    try {
      // Confirm deletion
      if (!confirm("Are you sure you want to delete this template?")) return

      // Check for existing instances
      const instancesResponse = await fetch(`/api/forms/templates/${template.id}/instances`)
      const instancesData = await instancesResponse.json()

      if (instancesData.count > 0) {
        if (!confirm(`This template has ${instancesData.count} instances. Deleting it will also delete all instances. Continue?`)) {
          return
        }
      }

      // Delete template
      const response = await fetch(`/api/forms/templates/${template.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete template")
      }

      toast({
        title: "Success",
        description: "Form template deleted successfully",
      })

      router.refresh()
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  return (
    <FormTemplateList
      templates={templates}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onPreview={handlePreview}
    />
  )
} 