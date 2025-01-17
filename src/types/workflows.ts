import { Department, Priority, WorkflowTask, WorkflowStatus } from "@prisma/client"

/**
 * Represents the metadata structure for a workflow task
 */
export interface WorkflowTaskMetadata {
  lastUpdated: string;
  version: number;
  estimatedDuration?: number;
  customFields?: Record<string, unknown>;
}

/**
 * Extended workflow task type with department information and strongly typed metadata
 */
export interface WorkflowTaskWithDepartment extends Omit<WorkflowTask, "metadata"> {
  metadata: WorkflowTaskMetadata;
  department?: Department | null;
  status: WorkflowStatus;
}

/**
 * Workflow task dependency type with strict typing
 */
export interface WorkflowTaskDependency {
  id: string;
  taskId: string;
  dependsOnId: string;
  type: "BLOCKING" | "NON_BLOCKING";  // Added dependency type
  task: WorkflowTaskWithDepartment;
  dependsOnTask: WorkflowTaskWithDepartment;
  createdAt: string;
  updatedAt: string;
}

/**
 * Extended workflow task type with all relations
 */
export interface WorkflowTaskWithRelations extends WorkflowTaskWithDepartment {
  dependencies: WorkflowTaskDependency[];  // Tasks that this task depends on
  dependsOn: WorkflowTaskDependency[];     // Tasks that depend on this task
  assignedTo?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

/**
 * Workflow task update payload type with strict validation
 */
export interface WorkflowTaskUpdatePayload {
  name?: string;
  description?: string | null;
  priority?: Priority;
  manHours?: number | null;
  order?: number;
  departmentId?: string | null;
  dependencies?: Array<{
    id: string;
    type: "BLOCKING" | "NON_BLOCKING";
  }>;
  metadata?: Partial<WorkflowTaskMetadata>;
  status?: WorkflowStatus;
}

/**
 * Workflow task create payload type with required fields
 */
export interface WorkflowTaskCreatePayload {
  name: string;
  description: string;  // Made required
  priority: Priority;
  manHours?: number | null;
  order?: number;
  departmentId?: string | null;
  dependencies?: Array<{
    id: string;
    type: "BLOCKING" | "NON_BLOCKING";
  }>;
  metadata?: WorkflowTaskMetadata;
  status: WorkflowStatus;  // Made required
}

/**
 * Workflow task validation error type
 */
export interface WorkflowTaskValidationError {
  field: keyof WorkflowTaskCreatePayload | keyof WorkflowTaskUpdatePayload;
  message: string;
}

/**
 * Workflow task response type for API endpoints
 */
export interface WorkflowTaskResponse {
  success: boolean;
  data?: WorkflowTaskWithRelations;
  errors?: WorkflowTaskValidationError[];
} 