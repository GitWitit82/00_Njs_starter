"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface CreateProjectDialogProps {
  trigger?: React.ReactNode
}

/**
 * Dialog for creating a new project
 * Includes project details, workflow selection, and department assignment
 */
export function CreateProjectDialog({ trigger }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Create Project</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new project and assign it to a workflow and department.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Project Details */}
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" placeholder="Enter project name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter project description"
              className="resize-none"
            />
          </div>

          {/* Department Selection */}
          <div className="grid gap-2">
            <Label htmlFor="department">Department</Label>
            <Select>
              <SelectTrigger id="department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Workflow Selection */}
          <div className="grid gap-2">
            <Label htmlFor="workflow">Workflow Template</Label>
            <Select>
              <SelectTrigger id="workflow">
                <SelectValue placeholder="Select workflow" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Workflow</SelectItem>
                <SelectItem value="express">Express Workflow</SelectItem>
                <SelectItem value="custom">Custom Workflow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="grid gap-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Create Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 