import { FormInstanceStatus, TaskStatus, ProjectStatus } from "@prisma/client"

type StatusType = FormInstanceStatus | TaskStatus | ProjectStatus | null | undefined

export function getStatusVariant(status: StatusType): "default" | "secondary" | "destructive" | "outline" {
  if (!status) return "default"

  switch (status) {
    case FormInstanceStatus.IN_PROGRESS:
    case TaskStatus.IN_PROGRESS:
    case ProjectStatus.IN_PROGRESS:
    case FormInstanceStatus.DRAFT:
    case FormInstanceStatus.ACTIVE:
    case FormInstanceStatus.PENDING_REVIEW:
      return "default"
    
    case FormInstanceStatus.COMPLETED:
    case TaskStatus.COMPLETED:
    case ProjectStatus.COMPLETED:
    case FormInstanceStatus.APPROVED:
      return "secondary"
    
    case ProjectStatus.CANCELLED:
    case FormInstanceStatus.REJECTED:
    case TaskStatus.BLOCKED:
      return "destructive"
    
    case FormInstanceStatus.ON_HOLD:
    case TaskStatus.ON_HOLD:
    case ProjectStatus.ON_HOLD:
      return "outline"
    
    default:
      return "default"
  }
} 