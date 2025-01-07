"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formTemplateSchema } from "@/lib/validations/form"
import { FormVersionControl } from "./FormVersionControl"
import { FormField } from "./FormField"
import { FormSection } from "./FormSection"
import { FormPreview } from "./FormPreview"

/**
 * Form builder component for creating and editing form templates
 */
export function FormBuilder({
  departments = [],
  workflows = [],
  initialData = null,
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("edit")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "FORM",
    departmentId: "",
    phaseId: "",
    schema: {
      sections: [],
    },
    layout: {},
    style: {},
    metadata: {},
    priority: "MEDIUM",
    order: 0,
    isActive: true,
    ...initialData,
  })

  // Load workflows for selected department
  const [filteredWorkflows, setFilteredWorkflows] = useState([])
  useEffect(() => {
    if (formData.departmentId) {
      setFilteredWorkflows(
        workflows.filter((w) => w.departmentId === formData.departmentId)
      )
    } else {
      setFilteredWorkflows([])
    }
  }, [formData.departmentId, workflows])

  // Load phases for selected workflow
  const [phases, setPhases] = useState([])
  useEffect(() => {
    if (formData.workflowId) {
      const workflow = workflows.find((w) => w.id === formData.workflowId)
      setPhases(workflow?.phases || [])
    } else {
      setPhases([])
    }
  }, [formData.workflowId, workflows])

  /**
   * Handle form field changes
   */
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  /**
   * Handles section management within the form builder
   */
  const handleAddSection = () => {
    const newSection = {
      id: crypto.randomUUID(),
      title: "New Section",
      description: "",
      fields: [],
    }
    setFormData((prev) => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: [...(prev.schema?.sections || []), newSection],
      },
    }))
  }

  /**
   * Updates a section's properties
   */
  const handleUpdateSection = (sectionId: string, updates: any) => {
    setFormData((prev) => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: prev.schema?.sections?.map((section) =>
          section.id === sectionId ? { ...section, ...updates } : section
        ),
      },
    }))
  }

  /**
   * Deletes a section from the form
   */
  const handleDeleteSection = (sectionId: string) => {
    setFormData((prev) => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: prev.schema?.sections?.filter((section) => section.id !== sectionId),
      },
    }))
  }

  /**
   * Renders a section with its fields
   */
  const renderSection = (section: any) => {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
      <Card key={section.id} className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="flex items-center space-x-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span className="text-lg font-medium">{section.title}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transform transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => handleAddField(section.id)}>
                Add Field
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteSection(section.id)}>
                Delete Section
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`section-${section.id}-title`}>Title</Label>
                  <Input
                    id={`section-${section.id}-title`}
                    value={section.title}
                    onChange={(e) =>
                      handleUpdateSection(section.id, { title: e.target.value })
                    }
                    placeholder="Enter section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`section-${section.id}-description`}>
                    Description
                  </Label>
                  <Textarea
                    id={`section-${section.id}-description`}
                    value={section.description}
                    onChange={(e) =>
                      handleUpdateSection(section.id, { description: e.target.value })
                    }
                    placeholder="Enter section description"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {section.fields.map((field: any) => (
                  <FormField
                    key={field.id}
                    field={field}
                    onUpdate={(updates) => handleUpdateField(section.id, field.id, updates)}
                    onDelete={() => handleDeleteField(section.id, field.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    )
  }

  /**
   * Save the form template
   */
  const handleSave = async () => {
    try {
      setIsLoading(true)

      // Validate form data
      const validatedData = formTemplateSchema.parse(formData)

      // Send request to API
      const response = await fetch("/api/forms/templates", {
        method: initialData ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save form template")
      }

      const savedTemplate = await response.json()

      toast({
        title: "Success",
        description: `Form template ${initialData ? "updated" : "created"} successfully`,
      })

      router.push(`/forms/templates/${savedTemplate.id}`)
    } catch (error) {
      console.error("Error saving form template:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save form template",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {initialData ? "Edit Form Template" : "Create Form Template"}
        </h1>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter form name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FORM">Form</SelectItem>
                  <SelectItem value="CHECKLIST">Checklist</SelectItem>
                  <SelectItem value="SURVEY">Survey</SelectItem>
                  <SelectItem value="INSPECTION">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter form description"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) => handleChange("departmentId", value)}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow">Workflow</Label>
              <Select
                value={formData.workflowId}
                onValueChange={(value) => handleChange("workflowId", value)}
                disabled={!formData.departmentId}
              >
                <SelectTrigger id="workflow">
                  <SelectValue placeholder="Select workflow" />
                </SelectTrigger>
                <SelectContent>
                  {filteredWorkflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phase">Phase</Label>
              <Select
                value={formData.phaseId}
                onValueChange={(value) => handleChange("phaseId", value)}
                disabled={!formData.workflowId}
              >
                <SelectTrigger id="phase">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {initialData && <FormVersionControl templateId={initialData.id} />}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="space-y-4">
          <div className="space-y-4">
            <Button onClick={handleAddSection}>Add Section</Button>
            {formData.schema?.sections?.map(renderSection)}
          </div>
        </TabsContent>
        <TabsContent value="preview">
          <FormPreview
            schema={formData.schema}
            layout={formData.layout}
            style={formData.style}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 