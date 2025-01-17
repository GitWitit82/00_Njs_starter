"use client"

import { Card } from "@/components/ui/card"
import { FormVersionData } from "@/types/forms"
import { formatDate } from "@/lib/utils"

interface FormVersionDiffProps {
  version: FormVersionData
  diff: {
    added: string[]
    removed: string[]
    modified: string[]
  }
}

/**
 * FormVersionDiff component for displaying differences between versions
 * @param {FormVersionDiffProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function FormVersionDiff({ version, diff }: FormVersionDiffProps) {
  const getChangeColor = (type: "added" | "removed" | "modified"): string => {
    switch (type) {
      case "added":
        return "text-green-600"
      case "removed":
        return "text-red-600"
      case "modified":
        return "text-yellow-600"
      default:
        return ""
    }
  }

  const getChangeSymbol = (type: "added" | "removed" | "modified"): string => {
    switch (type) {
      case "added":
        return "+"
      case "removed":
        return "-"
      case "modified":
        return "~"
      default:
        return ""
    }
  }

  const getChangeDescription = (type: "added" | "removed" | "modified"): string => {
    switch (type) {
      case "added":
        return "Added"
      case "removed":
        return "Removed"
      case "modified":
        return "Modified"
      default:
        return ""
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">
            Changes in Version {version.versionNumber}
          </h3>
          <span className="text-sm text-muted-foreground">
            {formatDate(version.createdAt)}
          </span>
        </div>

        <div className="space-y-4" role="region" aria-label="Version changes summary">
          {version.notes && (
            <p className="text-sm text-muted-foreground">{version.notes}</p>
          )}

          <div className="space-y-2">
            {["added", "removed", "modified"].map((type) => {
              const changes = diff[type as keyof typeof diff]
              if (!changes?.length) return null

              return (
                <div
                  key={type}
                  className="space-y-1"
                  role="list"
                  aria-label={`${getChangeDescription(type as "added" | "removed" | "modified")} changes`}
                >
                  <h4 className={`text-sm font-medium ${getChangeColor(type as "added" | "removed" | "modified")}`}>
                    {getChangeDescription(type as "added" | "removed" | "modified")}
                  </h4>
                  {changes.map((change, index) => (
                    <div
                      key={index}
                      className="text-sm"
                      role="listitem"
                    >
                      <span className="mr-2 font-mono">
                        {getChangeSymbol(type as "added" | "removed" | "modified")}
                      </span>
                      {change}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
} 