'use client'

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { FormSchema } from "@/types/form"
import { FormBuilder } from "./FormBuilder"
import { toast } from "sonner"

interface FormBuilderWrapperProps {
  initialData?: FormSchema
  onSave: (data: FormSchema) => Promise<void>
}

/**
 * FormBuilderWrapper component for managing form builder state
 * @param {FormBuilderWrapperProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function FormBuilderWrapper({
  initialData,
  onSave,
}: FormBuilderWrapperProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = useCallback(
    async (data: FormSchema) => {
      try {
        setIsLoading(true)
        await onSave(data)
        toast.success("Form saved successfully")
        router.refresh()
      } catch (error) {
        console.error("Failed to save form:", error)
        toast.error("Failed to save form")
      } finally {
        setIsLoading(false)
      }
    },
    [onSave, router]
  )

  return (
    <FormBuilder
      initialData={initialData}
      onSave={handleSave}
      isLoading={isLoading}
    />
  )
} 