"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface ProjectDetailsProps {
  project: Project
  onUpdate: (data: ProjectUpdateData) => Promise<void>
  isLoading?: boolean
}

interface Project {
  id: string
  name: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
}

interface ProjectUpdateData {
  name: string
  description: string
  status: string
}

/**
 * ProjectDetails component for displaying and editing project details
 * @param {ProjectDetailsProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function ProjectDetails({
  project,
  onUpdate,
  isLoading = false,
}: ProjectDetailsProps) {
  const [formData, setFormData] = useState<ProjectUpdateData>({
    name: project.name,
    description: project.description,
    status: project.status,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onUpdate(formData)
      toast.success("Project updated successfully")
    } catch {
      toast.error("Failed to update project")
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter project name"
            disabled={isLoading}
            required
          />
        </div>
        <div>
          <Label htmlFor="project-description">Description</Label>
          <Textarea
            id="project-description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Enter project description"
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="project-status">Status</Label>
          <Input
            id="project-status"
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.value }))
            }
            placeholder="Enter project status"
            disabled={isLoading}
            required
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Card>
  )
} 