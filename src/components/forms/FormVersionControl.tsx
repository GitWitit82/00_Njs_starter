"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormTemplate } from "@prisma/client"

interface Version {
  id: string
  version: number
  templateId: string
  schema: any
  layout?: any
  style?: any
  metadata?: any
  isActive: boolean
  createdAt: Date
  createdById: string
  changelog?: string
}

interface FormVersionControlProps {
  templateId: string
  onVersionChange?: (version: Version) => void
}

/**
 * Form version control component for managing form template versions
 */
export function FormVersionControl({
  templateId,
  onVersionChange,
}: FormVersionControlProps) {
  const { toast } = useToast()
  const [versions, setVersions] = useState<Version[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [changelog, setChangelog] = useState("")

  // Fetch versions on mount
  useEffect(() => {
    fetchVersions()
  }, [templateId])

  const fetchVersions = async () => {
    try {
      const response = await fetch(`/api/forms/templates/${templateId}/versions`)
      if (!response.ok) throw new Error("Failed to fetch versions")

      const data = await response.json()
      setVersions(data)

      // Select the current version by default
      const template = await fetch(`/api/forms/templates/${templateId}`).then(res => res.json())
      if (template?.currentVersion) {
        const currentVersion = data.find((v: Version) => v.version === template.currentVersion)
        if (currentVersion) {
          setSelectedVersion(currentVersion.id)
          onVersionChange?.(currentVersion)
        }
      }
    } catch (error) {
      console.error("Error fetching versions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch form versions",
        variant: "destructive",
      })
    }
  }

  const handleVersionChange = (versionId: string) => {
    const version = versions.find((v) => v.id === versionId)
    if (version) {
      setSelectedVersion(versionId)
      onVersionChange?.(version)
    }
  }

  const handleCreateVersion = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/forms/templates/${templateId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changelog }),
      })

      if (!response.ok) throw new Error("Failed to create version")

      const newVersion = await response.json()
      setVersions((prev) => [...prev, newVersion])
      setSelectedVersion(newVersion.id)
      onVersionChange?.(newVersion)
      setChangelog("")
      setIsDialogOpen(false)

      toast({
        title: "Success",
        description: "New version created successfully",
      })
    } catch (error) {
      console.error("Error creating version:", error)
      toast({
        title: "Error",
        description: "Failed to create new version",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label>Version</Label>
          <Select value={selectedVersion} onValueChange={handleVersionChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((version) => (
                <SelectItem key={version.id} value={version.id}>
                  v{version.version} ({new Date(version.createdAt).toLocaleDateString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Version</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Version</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="changelog">Changelog</Label>
                <Textarea
                  id="changelog"
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="Describe the changes in this version..."
                />
              </div>
              <Button
                onClick={handleCreateVersion}
                disabled={isLoading || !changelog.trim()}
              >
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selectedVersion && (
        <div className="text-sm text-gray-500">
          {versions.find((v) => v.id === selectedVersion)?.changelog}
        </div>
      )}
    </div>
  )
} 