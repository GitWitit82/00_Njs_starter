"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { FormTemplate } from "@prisma/client"
import { FormTemplateList } from "@/components/forms/FormTemplateList"

interface FormTemplateListWrapperProps {
  templates: (FormTemplate & {
    department: { id: string; name: string; color: string } | null
  })[]
}

export function FormTemplateListWrapper({
  templates,
}: FormTemplateListWrapperProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleEdit = (template: FormTemplate) => {
    router.push(`/forms/templates/${template.id}`)
  }

  const handleDelete = async (template: FormTemplate) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      const response = await fetch(`/api/forms/templates/${template.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete template")

      toast({
        title: "Success",
        description: "Form template deleted successfully",
      })

      router.refresh()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  return (
    <FormTemplateList
      templates={templates}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
} 