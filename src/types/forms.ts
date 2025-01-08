import { FormInstanceStatus, FormStatus, ChangeType } from "@prisma/client"

/**
 * Form status history entry type
 */
export interface FormStatusHistoryEntry {
  id: string
  instanceId: string
  status: FormInstanceStatus
  changedAt: Date
  changedById: string
  metadata?: {
    taskStatus?: string
    phaseStatus?: string
    completionPercentage?: number
    [key: string]: any
  }
  comments?: string
}

/**
 * Form completion requirement type
 */
export interface FormCompletionRequirement {
  id: string
  templateId: string
  phaseId: string
  isRequired: boolean
  requiredForPhase: boolean
  requiredForTask: boolean
  completionOrder?: number
  dependsOn: string[] // IDs of forms this form depends on
  dependentForms: string[] // IDs of forms that depend on this form
  createdAt: Date
  updatedAt: Date
}

/**
 * Form status update request type
 */
export interface FormStatusUpdateRequest {
  status: FormInstanceStatus
  comments?: string
  metadata?: Record<string, any>
}

/**
 * Form completion check result type
 */
export interface FormCompletionCheckResult {
  isComplete: boolean
  missingRequirements: {
    formId: string
    formName: string
    requirement: string
  }[]
  nextRequiredForms: {
    formId: string
    formName: string
    order: number
  }[]
}

/**
 * Form status tracking metadata type
 */
export interface FormStatusMetadata {
  taskStatus?: string
  phaseStatus?: string
  completionPercentage?: number
  lastModified?: Date
  modifiedBy?: string
  validationErrors?: string[]
  customFields?: Record<string, any>
}

/**
 * Form dependency graph type
 */
export interface FormDependencyNode {
  formId: string
  formName: string
  status: FormInstanceStatus
  dependencies: string[]
  dependents: string[]
  order?: number
  isBlocking: boolean
} 