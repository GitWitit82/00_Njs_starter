'use client'

import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDate } from "@/lib/utils"
import { FormVersionData } from "@/types/forms"

interface FormVersionHistoryProps {
  versions: FormVersionData[]
  selectedVersion: FormVersionData | null
  onVersionSelect: (version: FormVersionData) => void
  isLoading: boolean
}

/**
 * FormVersionHistory component for displaying version history
 * @param {FormVersionHistoryProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function FormVersionHistory({
  versions,
  selectedVersion,
  onVersionSelect,
  isLoading,
}: FormVersionHistoryProps) {
  return (
    <ScrollArea className="h-[300px] w-[400px] rounded-md border p-4">
      <div className="space-y-4">
        <h3 className="font-medium">Version History</h3>
        <div 
          className="space-y-2"
          role="listbox"
          aria-label="Version history"
        >
          {versions.map((version) => (
            <button
              key={version.id}
              onClick={() => onVersionSelect(version)}
              className={`w-full rounded-lg p-3 text-left hover:bg-muted ${
                selectedVersion?.id === version.id ? "bg-muted" : ""
              }`}
              disabled={isLoading}
              role="option"
              aria-selected={selectedVersion?.id === version.id}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Version {version.versionNumber}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(version.createdAt)}
                </span>
              </div>
              {version.notes && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {version.notes}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
} 