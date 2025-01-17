import { FormInstance, FormTemplate, FormVersion, User } from "@prisma/client"

export interface FormSchema {
  sections: FormSection[]
  metadata?: Record<string, unknown>
}

export interface FormSection {
  id: string
  title: string
  description?: string
  fields: FormField[]
}

export interface FormField {
  id: string
  type: string
  label: string
  required?: boolean
  placeholder?: string
  defaultValue?: unknown
  options?: string[]
  validation?: {
    pattern?: string
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
  }
}

export interface FormTemplateWithRelations extends FormTemplate {
  creator: User
  versions: FormVersion[]
}

export interface FormVersionWithUser extends FormVersion {
  createdBy: User
}

export interface FormInstanceWithRelations extends FormInstance {
  template: FormTemplate
  version: FormVersion
  assignee: User | null
}

export interface FormValidationError {
  field: string
  message: string
  section?: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: FormValidationError[]
} 