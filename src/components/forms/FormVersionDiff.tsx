"use client"

import * as React from "react"
import { FormVersion } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FormVersionService } from "@/lib/services/form-version.service"

interface FormVersionDiffProps {
  version1: FormVersion
  version2: FormVersion
  className?: string
}

type DiffType = "add" | "remove" | "update" | "type_change" | "array_add" | "array_remove"

interface Difference {
  path: string
  type: DiffType
  value?: any
  oldValue?: any
  newValue?: any
}

/**
 * FormVersionDiff component for displaying differences between two form versions
 */
export function FormVersionDiff({
  version1,
  version2,
  className,
}: FormVersionDiffProps) {
  const differences = React.useMemo(
    () => FormVersionService.compareVersions(version1, version2),
    [version1, version2]
  )

  /**
   * Renders a badge for the difference type
   */
  const renderDiffTypeBadge = (type: DiffType) => {
    const variants: Record<DiffType, { variant: "default" | "destructive" | "outline"; label: string }> = {
      add: { variant: "default", label: "Added" },
      remove: { variant: "destructive", label: "Removed" },
      update: { variant: "outline", label: "Updated" },
      type_change: { variant: "outline", label: "Type Changed" },
      array_add: { variant: "default", label: "Array Item Added" },
      array_remove: { variant: "destructive", label: "Array Item Removed" },
    }

    const { variant, label } = variants[type]
    return <Badge variant={variant}>{label}</Badge>
  }

  /**
   * Renders the value of a difference
   */
  const renderDiffValue = (diff: Difference) => {
    if (diff.type === "update" || diff.type === "type_change") {
      return (
        <div className="space-y-1">
          <div className="text-sm text-destructive line-through">
            {JSON.stringify(diff.oldValue)}
          </div>
          <div className="text-sm text-green-600">
            {JSON.stringify(diff.newValue)}
          </div>
        </div>
      )
    }

    return (
      <div className="text-sm">
        {JSON.stringify(diff.value)}
      </div>
    )
  }

  /**
   * Renders a section of differences
   */
  const renderDiffSection = (title: string, diffs: Difference[]) => {
    if (diffs.length === 0) return null

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{title}</h3>
        {diffs.map((diff, index) => (
          <Card key={index} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{diff.path}</span>
              {renderDiffTypeBadge(diff.type)}
            </div>
            {renderDiffValue(diff)}
          </Card>
        ))}
      </div>
    )
  }

  return (
    <ScrollArea className={className}>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Version Comparison</h2>
            <p className="text-sm text-muted-foreground">
              Comparing v{version1.version} with v{version2.version}
            </p>
          </div>
        </div>

        {renderDiffSection("Schema Changes", differences.schema)}
        {renderDiffSection("Layout Changes", differences.layout)}
        {renderDiffSection("Style Changes", differences.style)}
        {renderDiffSection("Metadata Changes", differences.metadata)}

        {Object.values(differences).every((d) => d.length === 0) && (
          <p className="text-center text-muted-foreground">
            No differences found between these versions
          </p>
        )}
      </div>
    </ScrollArea>
  )
} 