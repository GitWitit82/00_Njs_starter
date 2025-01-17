"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { FormVersionHistory } from "./FormVersionHistory"
import { FormVersionDiff } from "./FormVersionDiff"
import { FormVersionCreate } from "./FormVersionCreate"
import { FormVersionService } from "@/services/form-version-service"
import { FormVersionData } from "@/types/forms"

interface FormVersionControlProps {
  templateId: string
  currentVersion: FormVersionData
}

interface VersionDiff {
  added: string[]
  removed: string[]
  modified: string[]
}

/**
 * FormVersionControl component for managing form versions
 * @param {FormVersionControlProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function FormVersionControl({
  templateId,
  currentVersion,
}: FormVersionControlProps) {
  const [versions, setVersions] = useState<FormVersionData[]>([])
  const [selectedVersion, setSelectedVersion] = useState<FormVersionData | null>(null)
  const [versionDiff, setVersionDiff] = useState<VersionDiff | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const versionService = useMemo(() => new FormVersionService(templateId), [templateId])

  const fetchVersions = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await versionService.getVersions()
      setVersions(data)
    } catch {
      toast.error("Failed to fetch versions")
    } finally {
      setIsLoading(false)
    }
  }, [versionService])

  const compareVersions = useCallback(async (version: FormVersionData) => {
    try {
      setIsLoading(true)
      const diff = await versionService.compareVersions(version.id, currentVersion.id)
      setVersionDiff(diff)
      setSelectedVersion(version)
    } catch {
      toast.error("Failed to compare versions")
      setVersionDiff(null)
    } finally {
      setIsLoading(false)
    }
  }, [currentVersion.id, versionService])

  const createVersion = useCallback(async (notes: string) => {
    try {
      setIsLoading(true)
      await versionService.createVersion(notes)
      await fetchVersions()
      setVersionDiff(null)
      toast.success("Version created successfully")
    } catch {
      toast.error("Failed to create version")
    } finally {
      setIsLoading(false)
    }
  }, [fetchVersions, versionService])

  useEffect(() => {
    fetchVersions()
  }, [fetchVersions])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <FormVersionHistory
          versions={versions}
          selectedVersion={selectedVersion}
          onVersionSelect={compareVersions}
          isLoading={isLoading}
        />
        <FormVersionCreate onSubmit={createVersion} isLoading={isLoading} />
      </div>
      {versionDiff && selectedVersion && (
        <FormVersionDiff version={selectedVersion} diff={versionDiff} />
      )}
    </div>
  )
} 