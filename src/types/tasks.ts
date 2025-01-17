import { Department, Priority, ProjectTask, TaskStatus, User } from "@prisma/client"

/**
 * Represents the metadata structure for a task
 */
export interface TaskMetadata {
  lastUpdated: string;
  version: number;
  customFields?: Record<string, unknown>;
}

/**
 * Extended task type with department information and strongly typed metadata
 */
export interface TaskWithDepartment extends Omit<ProjectTask, "metadata"> {
  metadata: TaskMetadata;
  department?: Department | null;
  assignedTo?: User | null;
  project?: {
    id: string;
    name: string;
    // Add more project fields as needed
  } | null;
}

/**
 * Enumeration of possible task activity types
 */
export const TaskActivityType = {
  STATUS_CHANGE: "STATUS_CHANGE",
  PRIORITY_CHANGE: "PRIORITY_CHANGE",
  ASSIGNMENT: "ASSIGNMENT",
  COMMENT: "COMMENT",
} as const;

export type TaskActivityType = typeof TaskActivityType[keyof typeof TaskActivityType];

/**
 * Task activity type with strict typing
 */
export interface TaskActivity {
  id: string;
  taskId: string;
  type: TaskActivityType;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email?: string | null;
  };
}

/**
 * Extended task type with all relations and activities
 */
export type TaskWithRelations = TaskWithDepartment & {
  activity: TaskActivity[];  // Changed from optional to required array
};

/**
 * Task update payload type with strict validation
 */
export interface TaskUpdatePayload {
  status?: TaskStatus;
  priority?: Priority;
  assignedToId?: string | null;
  departmentId?: string | null;
  metadata?: Partial<TaskMetadata>;
}

/**
 * Task create payload type with required fields
 */
export interface TaskCreatePayload {
  name: string;
  description: string;  // Made required
  status: TaskStatus;
  priority: Priority;
  assignedToId?: string;
  departmentId?: string;
  projectId?: string;
  metadata?: TaskMetadata;
}

/**
 * Task validation error type
 */
export interface TaskValidationError {
  field: keyof TaskCreatePayload | keyof TaskUpdatePayload;
  message: string;
}

/**
 * Task response type for API endpoints
 */
export interface TaskResponse {
  success: boolean;
  data?: TaskWithRelations;
  errors?: TaskValidationError[];
} 