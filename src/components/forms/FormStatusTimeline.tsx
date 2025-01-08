import React from 'react'
import { FormStatusHistoryEntry } from '@/types/forms'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface FormStatusTimelineProps {
  history: FormStatusHistoryEntry[]
  className?: string
}

/**
 * Component for displaying form status history in a timeline format
 */
export function FormStatusTimeline({
  history,
  className
}: FormStatusTimelineProps) {
  // Get status icon and color
  const getStatusDetails = (status: string) => {
    const details = {
      ACTIVE: {
        icon: '🔵',
        color: 'bg-blue-500',
        textColor: 'text-blue-700'
      },
      IN_PROGRESS: {
        icon: '⚡',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700'
      },
      PENDING_REVIEW: {
        icon: '👀',
        color: 'bg-purple-500',
        textColor: 'text-purple-700'
      },
      COMPLETED: {
        icon: '✅',
        color: 'bg-green-500',
        textColor: 'text-green-700'
      },
      ARCHIVED: {
        icon: '📦',
        color: 'bg-gray-500',
        textColor: 'text-gray-700'
      },
      ON_HOLD: {
        icon: '⏸️',
        color: 'bg-red-500',
        textColor: 'text-red-700'
      }
    }
    return details[status as keyof typeof details] || details.ACTIVE
  }

  return (
    <Card className={cn("p-4", className)}>
      <h3 className="font-semibold mb-4">Status History</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {history.map((entry, index) => {
            const statusDetails = getStatusDetails(entry.status)
            const isFirst = index === 0
            const isLast = index === history.length - 1

            return (
              <div
                key={entry.id}
                className="relative pl-6 pb-4"
              >
                {/* Timeline Line */}
                {!isLast && (
                  <div
                    className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200"
                  />
                )}

                {/* Status Icon */}
                <div
                  className={cn(
                    "absolute left-0 top-1 w-[22px] h-[22px] rounded-full flex items-center justify-center",
                    statusDetails.color
                  )}
                >
                  <span className="text-xs">{statusDetails.icon}</span>
                </div>

                {/* Status Content */}
                <div className="ml-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn("font-medium", statusDetails.textColor)}
                    >
                      {entry.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(entry.changedAt), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Comments */}
                  {entry.comments && (
                    <p className="mt-1 text-sm text-gray-600">
                      {entry.comments}
                    </p>
                  )}

                  {/* Metadata */}
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <div className="mt-2 space-y-1">
                      {Object.entries(entry.metadata).map(([key, value]) => (
                        <div
                          key={key}
                          className="text-xs text-gray-500 flex items-center gap-1"
                        >
                          <span className="font-medium">{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Changed By */}
                  <div className="mt-2 text-xs text-gray-400">
                    Changed by {entry.changedBy?.name || 'Unknown User'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </Card>
  )
} 