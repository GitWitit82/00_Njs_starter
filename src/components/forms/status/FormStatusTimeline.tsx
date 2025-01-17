import { FormStatusHistory } from "@/types/form"
import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface FormStatusTimelineProps {
  history: FormStatusHistory[]
}

/**
 * FormStatusTimeline component for displaying form status history
 * @param {FormStatusTimelineProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function FormStatusTimeline({ history }: FormStatusTimelineProps) {
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "draft":
        return "text-gray-500"
      case "pending":
        return "text-yellow-500"
      case "approved":
        return "text-green-500"
      case "rejected":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Status History</h3>
        <div className="space-y-4">
          {history.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4"
              role="listitem"
              aria-label={`Status changed to ${item.status}`}
            >
              <div
                className={`mt-1 h-2 w-2 rounded-full ${getStatusColor(
                  item.status
                )}`}
                aria-hidden="true"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={`font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </p>
                  <time
                    className="text-sm text-muted-foreground"
                    dateTime={item.timestamp.toISOString()}
                  >
                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                  </time>
                </div>
                {item.comment && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.comment}
                  </p>
                )}
                {item.user && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    By {item.user.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
} 