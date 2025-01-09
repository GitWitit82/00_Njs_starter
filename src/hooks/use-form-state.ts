'use client'

import { useState } from 'react'
import { formTemplateSchema, type FormTemplate } from '@/lib/validations/form'
import { toast } from '@/components/ui/use-toast'

interface UseFormStateProps {
  initialData?: Partial<FormTemplate>
  onSuccess?: () => void
}

interface UseFormStateReturn {
  formData: Partial<FormTemplate>
  errors: Record<string, string>
  isPending: boolean
  isSaving: boolean
  updateForm: (updates: Partial<FormTemplate>) => void
  saveForm: () => Promise<void>
  validateForm: () => boolean
}

/**
 * Custom hook for managing form state with validation
 */
export function useFormState({
  initialData,
  onSuccess
}: UseFormStateProps): UseFormStateReturn {
  const [formData, setFormData] = useState<Partial<FormTemplate>>(initialData || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, setIsPending] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const updateForm = (updates: Partial<FormTemplate>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates)
    setErrors(prev => {
      const newErrors = { ...prev }
      updatedFields.forEach(field => delete newErrors[field])
      return newErrors
    })
  }

  const validateForm = () => {
    try {
      formTemplateSchema.parse(formData)
      setErrors({})
      return true
    } catch (error: any) {
      const newErrors: Record<string, string> = {}
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path.join('.')
          newErrors[path] = err.message
        })
      }
      setErrors(newErrors)
      return false
    }
  }

  const saveForm = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSaving(true)
      // TODO: Implement API call to save form
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call
      toast({
        title: "Success",
        description: "Form saved successfully."
      })
      onSuccess?.()
    } catch (error) {
      console.error('Error saving form:', error)
      toast({
        title: "Error",
        description: "Failed to save form. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return {
    formData,
    errors,
    isPending,
    isSaving,
    updateForm,
    saveForm,
    validateForm
  }
} 