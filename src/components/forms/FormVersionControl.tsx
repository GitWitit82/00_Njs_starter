"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { FormTemplate, FormVersion } from "@prisma/client"

interface FormVersionControlProps {
  template: FormTemplate & {
    versions: FormVersion[]
  }
  onVersionChange: (version: FormVersion) => void
  onCreateVersion: (changelog: string) => Promise<void>
}

/**
 * FormVersionControl component for managing form template versions
 * Allows switching between versions and creating new versions
 */
export function FormVersionControl({
  template,
  onVersionChange,
  onCreateVersion,
}: FormVersionControlProps) {
  const { toast } = useToast()
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [changelog, setChangelog] = React.useState("")
  const [selectedVersion, setSelectedVersion] = React.useState<string>(
    template.currentVersion.toString()
  )

  /**
   * Handles version selection change
   */
  const handleVersionChange = (version: string) => {
    setSelectedVersion(version)
    const selectedVersionData = template.versions.find(
      (v) => v.version.toString() === version
    )
    if (selectedVersionData) {
      onVersionChange(selectedVersionData)
    }
  }

  /**
   * Handles creating a new version
   */
  const handleCreateVersion = async () => {
    if (!changelog.trim()) {
      toast({
        title: "Error",
        description: "Please provide a changelog message",
        variant: "destructive",
      })
      return
    }

    try {
      await onCreateVersion(changelog)
      setIsCreateOpen(false)
      setChangelog("")
      toast({
        title: "Success",
        description: "New version created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new version",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Label>Version</Label>
          <Select value={selectedVersion} onValueChange={handleVersionChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {template.versions.map((version) => (
                <SelectItem
                  key={version.id}
                  value={version.version.toString()}
                >
                  {`v${version.version}${
                    version.version === template.currentVersion ? " (Current)" : ""
                  }`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Create New Version</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Version</DialogTitle>
              <DialogDescription>
                Create a new version of this form template. Please describe the changes
                you are making.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="changelog">Changelog</Label>
                <Textarea
                  id="changelog"
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="Describe the changes in this version..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateVersion}>Create Version</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Version Info */}
      {template.versions.map((version) => (
        version.version.toString() === selectedVersion && (
          <div key={version.id} className="space-y-2 text-sm text-muted-foreground">
            <p>Created: {new Date(version.createdAt).toLocaleString()}</p>
            {version.changelog && (
              <p>Changes: {version.changelog}</p>
            )}
          </div>
        )
      ))}
    </div>
  )
} 