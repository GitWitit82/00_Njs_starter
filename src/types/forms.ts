import { Department, FormTemplate, FormInstance, Workflow, Phase, Project } from "@prisma/client"

/**
 * Form template with department information
 */
export interface FormTemplateWithDepartment extends FormTemplate {
  department: Pick<Department, "id" | "name" | "color"> | null
}

/**
 * Form template with all relations
 */
export interface FormTemplateWithRelations extends FormTemplate {
  department: Department | null
  workflow: Workflow | null
  phase: Phase | null
  instances: FormInstance[]
}

/**
 * Form instance with all relations
 */
export interface FormInstanceWithRelations extends FormInstance {
  template: FormTemplate & {
    department: Department | null
    workflow: Workflow | null
    phase: Phase | null
  }
  project: Project | null
  responses: Array<{
    id: string
    createdAt: Date
    data: Record<string, any>
  }>
}

/**
 * Form status update request
 */
export interface FormStatusUpdateRequest {
  status: string
  comment?: string
  metadata?: Record<string, any>
}

/**
 * Form completion check result
 */
export interface FormCompletionCheckResult {
  canComplete: boolean
  missingRequirements?: string[]
  blockedBy?: string[]
}

/**
 * Form status metadata
 */
export interface FormStatusMetadata {
  changedBy: string
  reason?: string
  dependencies?: string[]
} 