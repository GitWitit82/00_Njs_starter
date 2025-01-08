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
import { FormPreview } from "./FormPreview"
import { useSession } from "next-auth/react"

interface Department {
  id: string;
  name: string;
  color: string;
}

interface Phase {
  id: string;
  name: string;
}

interface Workflow {
  id: string;
  name: string;
  description?: string | null;
  phases: Phase[];
  createdAt: Date;
  updatedAt: Date;
}

interface Field {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: any[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  fields: Field[];
}

interface FormSchema {
  sections: Section[];
}

interface FormData {
  id?: string;
  name: string;
  description: string;
  type: string;
  departmentId: string;
  workflowId?: string;
  phaseId?: string;
  schema: FormSchema;
  layout: Record<string, any>;
  style: Record<string, any>;
  metadata: Record<string, any>;
  order: number;
  isActive: boolean;
}

interface FormBuilderProps {
  departments?: Department[];
  workflows?: Workflow[];
  initialData?: Partial<FormData> | null;
}

/**
 * Form builder component for creating and editing form templates
 */
export function FormBuilder({
  departments = [],
  workflows = [],
  initialData = null,
}: FormBuilderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("edit")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<FormData>(() => {
    const defaultData: FormData = {
      name: "",
      description: "",
      type: "FORM",
      departmentId: "",
      workflowId: "",
      phaseId: "",
      schema: {
        sections: [],
      },
      layout: {},
      style: {},
      metadata: {},
      order: 0,
      isActive: true,
    }
    return initialData ? { ...defaultData, ...initialData } : defaultData
  })

  // Load workflows for selected department
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([])
  useEffect(() => {
    // Show all workflows instead of filtering by department
    setFilteredWorkflows(workflows)
  }, [workflows])

  // Load phases for selected workflow
  const [phases, setPhases] = useState<Phase[]>([])
  useEffect(() => {
    if (formData.workflowId) {
      const workflow = workflows.find((w) => w.id === formData.workflowId)
      setPhases(workflow?.phases || [])
    } else {
      setPhases([])
    }
  }, [formData.workflowId, workflows])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.href))
    }
  }, [status, router])

  /**
   * Validates the form and returns true if valid
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = "Form name is required"
    }
    if (!formData.type || !["FORM", "CHECKLIST", "SURVEY", "INSPECTION"].includes(formData.type)) {
      newErrors.type = "Valid form type is required"
    }
    if (!formData.departmentId) {
      newErrors.departmentId = "Department is required"
    }
    if (!formData.workflowId) {
      newErrors.workflowId = "Workflow is required"
    }
    if (!formData.phaseId) {
      newErrors.phaseId = "Phase is required"
    }
    if (!formData.schema?.sections) {
      newErrors.schema = "Form schema is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form field changes
   */
  const handleChange = (field: string, value: any) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error for the field when it's changed
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  /**
   * Handles section management within the form builder
   */
  const handleAddSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      title: "New Section",
      description: "",
      fields: [],
    }
    setFormData((prev: FormData) => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: [...prev.schema.sections, newSection],
      },
    }))
  }

  /**
   * Updates a section's properties
   */
  const handleUpdateSection = (sectionId: string, updates: Partial<Section>) => {
    setFormData((prev: FormData) => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: prev.schema.sections.map((section) =>
          section.id === sectionId ? { ...section, ...updates } : section
        ),
      },
    }))
  }

  /**
   * Deletes a section from the form
   */
  const handleDeleteSection = (sectionId: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: prev.schema.sections.filter((section) => section.id !== sectionId),
      },
    }))
  }

  /**
   * Handles adding a new field to a section
   */
  const handleAddField = (sectionId: string) => {
    const newField: Field = {
      id: crypto.randomUUID(),
      label: "New Field",
      type: "text",
      required: false,
    }
    setFormData((prev: FormData) => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: prev.schema.sections.map((section) =>
          section.id === sectionId
            ? { ...section, fields: [...section.fields, newField] }
            : section
        ),
      },
    }))
  }

  /**
   * Updates a field's properties
   */
  const handleUpdateField = (sectionId: string, fieldId: string, updates: Partial<Field>) => {
    setFormData((prev: FormData) => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: prev.schema.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                fields: section.fields.map((field) =>
                  field.id === fieldId ? { ...field, ...updates } : field
                ),
              }
            : section
        ),
      },
    }))
  }

  /**
   * Deletes a field from a section
   */
  const handleDeleteField = (sectionId: string, fieldId: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: prev.schema.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                fields: section.fields.filter((field) => field.id !== fieldId),
              }
            : section
        ),
      },
    }))
  }

  /**
   * Renders a section with its fields
   */
  const renderSection = (section: Section) => (
    <div key={section.id} className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Label htmlFor={`section-${section.id}-title`}>Title</Label>
            <Input
              id={`section-${section.id}-title`}
              value={section.title}
              onChange={(e) => handleUpdateSection(section.id, { title: e.target.value })}
              placeholder="Enter section title"
            />
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => handleAddField(section.id)}>
              Add Field
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteSection(section.id)}>
              Delete Section
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor={`section-${section.id}-description`}>Description</Label>
          <Textarea
            id={`section-${section.id}-description`}
            value={section.description}
            onChange={(e) => handleUpdateSection(section.id, { description: e.target.value })}
            placeholder="Enter section description"
          />
        </div>

        <div className="mt-4 space-y-4">
          {section.fields.map((field) => (
            <FormField
              key={field.id}
              field={field}
              onUpdate={(updates) => handleUpdateField(section.id, field.id, updates)}
              onDelete={() => handleDeleteField(section.id, field.id)}
            />
          ))}
        </div>
      </Card>
    </div>
  )

  /**
   * Save the form template
   */
  const handleSave = async () => {
    if (status !== "authenticated") {
      toast({
        title: "Error",
        description: "You must be logged in to save a form template",
        variant: "destructive",
      })
      router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.href))
      return
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Prepare the data for submission
      const templateData = {
        name: formData.name.trim(),
        description: formData.description || "",
        type: formData.type,
        departmentId: formData.departmentId,
        workflowId: formData.workflowId,
        phaseId: formData.phaseId,
        schema: {
          sections: formData.schema.sections.map(section => ({
            id: section.id,
            title: section.title.trim(),
            description: section.description || "",
            fields: section.fields.map(field => ({
              id: field.id,
              label: field.label.trim(),
              type: field.type,
              required: field.required || false,
              options: field.options || []
            }))
          }))
        },
        layout: {},
        style: {},
        metadata: {},
        order: formData.order || 0,
        isActive: true
      }

      // Send request to API
      const response = await fetch(
        "/api/forms/templates" + (initialData?.id ? `/${initialData.id}` : ""), 
        {
          method: initialData?.id ? "PUT" : "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(templateData),
        }
      )

      let responseData
      try {
        responseData = await response.json()
      } catch (error) {
        throw new Error("Failed to parse server response")
      }

      if (!response.ok || !responseData.success) {
        // Handle specific error cases
        if (response.status === 401) {
          toast({
            title: "Session Expired",
            description: "Please log in again to continue",
            variant: "destructive",
          })
          router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.href))
          return
        }

        // Handle validation errors
        if (response.status === 422 && Array.isArray(responseData.details)) {
          const errorMessage = responseData.details
            .map((error: any) => error.message)
            .join(", ")
          toast({
            title: "Validation Error",
            description: errorMessage,
            variant: "destructive",
          })
          return
        }

        // Handle other error cases
        const errorMessage = typeof responseData.details === 'string' 
          ? responseData.details 
          : responseData.error || "Failed to save form template"
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      // Handle successful response
      toast({
        title: "Success",
        description: `Form template ${initialData?.id ? "updated" : "created"} successfully`,
      })

      if (!initialData?.id && responseData.data?.id) {
        router.push(`/forms/templates/${responseData.data.id}`)
      }
    } catch (error) {
      // Handle unexpected errors
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Automatically set type to CHECKLIST if name contains "print checklist"
    if (formData.name.toLowerCase().includes('print checklist') && formData.type !== 'CHECKLIST') {
      handleChange('type', 'CHECKLIST')
    }
  }, [formData.name])

  // Don't render the form if not authenticated
  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">
          {initialData?.id ? "Edit Form Template" : "Create Form Template"}
        </h2>
        <Button 
          onClick={handleSave} 
          disabled={isLoading || Object.keys(errors).length > 0}
        >
          {isLoading ? "Saving..." : "Save Form"}
        </Button>
      </div>

      {initialData?.id && <FormVersionControl templateId={initialData.id} />}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="form-name" className="flex items-center">
                  Form Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="form-name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter form name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-type" className="flex items-center">
                  Form Type <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger id="form-type" className={errors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select form type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FORM">Form</SelectItem>
                    <SelectItem value="CHECKLIST">Checklist</SelectItem>
                    <SelectItem value="SURVEY">Survey</SelectItem>
                    <SelectItem value="INSPECTION">Inspection</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-description">Description</Label>
              <Textarea
                id="form-description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter form description"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="form-department" className="flex items-center">
                  Department <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => handleChange("departmentId", value)}
                >
                  <SelectTrigger id="form-department" className={errors.departmentId ? "border-red-500" : ""}>
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
                {errors.departmentId && (
                  <p className="text-sm text-red-500">{errors.departmentId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-workflow" className="flex items-center">
                  Workflow <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formData.workflowId}
                  onValueChange={(value) => handleChange("workflowId", value)}
                >
                  <SelectTrigger id="form-workflow" className={errors.workflowId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    {workflows.map((workflow) => (
                      <SelectItem key={workflow.id} value={workflow.id}>
                        {workflow.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.workflowId && (
                  <p className="text-sm text-red-500">{errors.workflowId}</p>
                )}
              </div>

              {formData.workflowId && (
                <div className="space-y-2">
                  <Label htmlFor="form-phase" className="flex items-center">
                    Phase <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.phaseId}
                    onValueChange={(value) => handleChange("phaseId", value)}
                  >
                    <SelectTrigger id="form-phase" className={errors.phaseId ? "border-red-500" : ""}>
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
                  {errors.phaseId && (
                    <p className="text-sm text-red-500">{errors.phaseId}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Button onClick={handleAddSection}>Add Section</Button>
              {formData.schema.sections.map(renderSection)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <FormPreview 
            formData={formData} 
            departments={departments}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 