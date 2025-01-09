'use client'

import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Department, FormTemplate, Workflow, Phase } from "@prisma/client"
import { LiveFormBuilder } from "./LiveFormBuilder"

interface WorkflowWithPhases extends Workflow {
  phases: Phase[]
}

interface FormBuilderWrapperProps {
  template: FormTemplate & {
    department: Department | null
    workflow: Workflow | null
  }
  departments: Department[]
  workflows: WorkflowWithPhases[]
  isNew?: boolean
}

/**
 * Client-side wrapper for LiveFormBuilder
 * Handles form state and API interactions for both new and existing templates
 */
export function FormBuilderWrapper({
  template,
  departments,
  workflows,
  isNew = false,
}: FormBuilderWrapperProps) {
  const router = useRouter()
  const { toast } = useToast()

  /**
   * Handle form save
   */
  const handleSave = async (data: FormTemplate) => {
    try {
      const url = isNew 
        ? '/api/forms/templates' 
        : `/api/forms/templates/${template.id}`

      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        if (response.status === 401) {
          toast({
            title: "Error",
            description: "Session expired. Please log in again.",
            variant: "destructive",
          })
          router.push('/auth/login')
          return
        }

        if (errorData.error === "Validation error") {
          toast({
            title: "Validation Error",
            description: (
              <ul className="list-disc pl-4 mt-2">
                {errorData.details.map((error: any, index: number) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            ),
            variant: "destructive",
          })
          return
        }

        throw new Error(errorData.error || `Failed to ${isNew ? 'create' : 'update'} template`)
      }

      toast({
        title: "Success",
        description: `Form template ${isNew ? 'created' : 'updated'} successfully`,
      })

      router.push('/forms/templates')
    } catch (error: any) {
      console.error('Save error:', error)
      toast({
        title: "Error",
        description: error?.message || `Failed to ${isNew ? 'create' : 'update'} template`,
        variant: "destructive",
      })
    }
  }

  return (
    <LiveFormBuilder
      template={template}
      departments={departments}
      workflows={workflows}
      onSave={handleSave}
    />
  )
} 