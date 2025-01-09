'use client'

import { useState, useEffect } from "react"
import { Department, FormTemplate as PrismaFormTemplate, Workflow as PrismaWorkflow, Phase, User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { PlusCircle, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { FormItem, FormSection, FormTemplate } from "@/lib/validations/form"
import { toast } from "sonner"
import { formTemplateSchema } from "@/lib/validations/form"

interface WorkflowWithPhases extends PrismaWorkflow {
  phases: Phase[]
}

interface LiveFormBuilderProps {
  template: PrismaFormTemplate & {
    department: Department | null
    workflow: WorkflowWithPhases | null
    user: User
  }
  departments: Department[]
  workflows: WorkflowWithPhases[]
  onSave: (data: FormTemplate) => Promise<void>
}

/**
 * Live form builder component
 * Allows creating and editing form templates with real-time preview
 */
export function LiveFormBuilder({
  template,
  departments,
  workflows,
  onSave
}: LiveFormBuilderProps) {
  const [formData, setFormData] = useState<FormTemplate>({
    id: "",
    name: "",
    description: undefined,
    departmentId: undefined,
    workflowId: undefined,
    phaseId: undefined,
    schema: { sections: [] },
    isActive: true,
    userId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoadingPhases, setIsLoadingPhases] = useState(false)
  const [isLoadingColor, setIsLoadingColor] = useState(false)
  const [loadingSections, setLoadingSections] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setIsLoadingData(true)
        setLoadError(null)
        
        // Provide default values if template is not provided
        const defaultTemplate = {
          id: crypto.randomUUID(),
          name: "",
          description: "",
          departmentId: null,
          workflowId: null,
          phaseId: null,
          schema: { sections: [] },
          isActive: true,
          user: {
            id: "default",
            name: "Default User"
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        // Use template data if available, otherwise use defaults
        const templateData = template || defaultTemplate
        
        setFormData({
          id: templateData.id,
          name: templateData.name,
          description: templateData.description || undefined,
          departmentId: templateData.departmentId || undefined,
          workflowId: templateData.workflowId || undefined,
          phaseId: templateData.phaseId || undefined,
          schema: templateData.schema as { sections: FormSection[] } || { sections: [] },
          isActive: templateData.isActive ?? true,
          userId: templateData.user.id,
          createdAt: templateData.createdAt,
          updatedAt: templateData.updatedAt,
        })
      } catch (error) {
        console.error("Error loading form data:", error)
        setLoadError(error instanceof Error ? error.message : "Failed to load form data")
        toast.error("Failed to load form data")
      } finally {
        setIsLoadingData(false)
        setIsLoading(false)
      }
    }

    loadFormData()
  }, [template])

  const clearAllErrors = () => {
    setErrors({})
  }

  const handleAddSection = async () => {
    const sectionId = crypto.randomUUID()
    try {
      clearAllErrors()
      setLoadingSections(prev => ({ ...prev, [sectionId]: true }))
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setFormData(prev => ({
        ...prev,
        schema: {
          ...prev.schema,
          sections: [
            ...prev.schema.sections,
            {
              id: sectionId,
              title: "New Section",
              type: "FORM",
              items: []
            }
          ]
        }
      }))
    } catch (error) {
      console.error("Error adding section:", error)
      toast.error("Failed to add section")
    } finally {
      setLoadingSections(prev => {
        const newState = { ...prev }
        delete newState[sectionId]
        return newState
      })
    }
  }

  const handleAddItem = (sectionId: string) => {
    clearAllErrors()
    setFormData(prev => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: prev.schema.sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                items: [
                  ...section.items,
                  {
                    id: crypto.randomUUID(),
                    content: "New Item",
                    type: "TEXT",
                    required: false
                  }
                ]
              }
            : section
        )
      }
    }))
  }

  const handleSectionChange = (sectionId: string, field: keyof FormSection, value: any) => {
    setFormData(prev => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: prev.schema.sections.map(section =>
          section.id === sectionId
            ? { ...section, [field]: value }
            : section
        )
      }
    }))
  }

  const handleItemChange = (sectionId: string, itemId: string, field: keyof FormItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: prev.schema.sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                items: section.items.map(item =>
                  item.id === itemId
                    ? { ...item, [field]: value }
                    : item
                )
              }
            : section
        )
      }
    }))
  }

  const handleDeleteSection = async (sectionId: string) => {
    try {
      clearAllErrors()
      setLoadingSections(prev => ({ ...prev, [sectionId]: true }))
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setFormData(prev => ({
        ...prev,
        schema: {
          ...prev.schema,
          sections: prev.schema.sections.filter(section => section.id !== sectionId)
        }
      }))
    } catch (error) {
      console.error("Error deleting section:", error)
      toast.error("Failed to delete section")
    } finally {
      setLoadingSections(prev => {
        const newState = { ...prev }
        delete newState[sectionId]
        return newState
      })
    }
  }

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    clearAllErrors()
    setFormData(prev => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: prev.schema.sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                items: section.items.filter(item => item.id !== itemId)
              }
            : section
        )
      }
    }))
  }

  const handleAddChecklistItem = (sectionId: string) => {
    clearAllErrors()
    setFormData(prev => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: prev.schema.sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                items: [
                  ...section.items,
                  {
                    id: crypto.randomUUID(),
                    content: "New Task",
                    type: "CHECKBOX",
                    required: false
                  }
                ]
              }
            : section
        )
      }
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setErrors({})
      
      // Validate form data
      const result = formTemplateSchema.safeParse(formData)
      if (!result.success) {
        const validationErrors: { [key: string]: string[] } = {}
        result.error.errors.forEach(err => {
          const path = err.path.join('.')
          if (!validationErrors[path]) {
            validationErrors[path] = []
          }
          validationErrors[path].push(err.message)
        })
        setErrors(validationErrors)
        toast.error(
          <div>
            <p>Please fix the following errors:</p>
            <ul className="list-disc pl-4 mt-2">
              {result.error.errors.map((err, i) => (
                <li key={i}>{err.message}</li>
              ))}
            </ul>
          </div>
        )
        return
      }

      await onSave(formData)
      toast.success("Form saved successfully")
    } catch (error) {
      console.error("Error saving form:", error)
      toast.error("Failed to save form. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const clearError = (path: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[path]
      return newErrors
    })
  }

  if (isLoading || isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-t-lg bg-gray-200 animate-pulse h-32" />
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-gray-100 animate-pulse h-24" />
          <div className="p-4 rounded-lg bg-gray-100 animate-pulse h-48" />
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="p-6 space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800">Error Loading Form</h3>
          <p className="text-sm text-red-600 mt-1">{loadError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div 
        className={cn(
          "p-6 rounded-t-lg text-white transition-colors duration-300",
          isLoadingColor && "animate-pulse"
        )}
        style={{ 
          backgroundColor: formData.departmentId 
            ? departments.find(d => d.id === formData.departmentId)?.color || '#e5e7eb'
            : '#e5e7eb'
        }}
      >
        {isLoadingColor && (
          <div className="absolute inset-0 bg-black/5 rounded-t-lg" />
        )}
        <Input
          className={cn(
            "text-2xl font-bold bg-transparent border-0 focus-visible:ring-0 placeholder:text-white/70 text-white",
            errors["name"] && "border-red-500"
          )}
          placeholder="Enter form name"
          value={formData.name}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, name: e.target.value }))
            clearError("name")
          }}
        />
        {errors["name"] && (
          <p className="text-sm text-red-500 mt-1">{errors["name"][0]}</p>
        )}
        <Textarea
          className={cn(
            "mt-2 bg-transparent border-0 focus-visible:ring-0 placeholder:text-white/70 text-white",
            errors["description"] && "border-red-500"
          )}
          placeholder="Enter form description (optional)"
          value={formData.description || ""}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, description: e.target.value }))
            clearError("description")
          }}
        />
        {errors["description"] && (
          <p className="text-sm text-red-500 mt-1">{errors["description"][0]}</p>
        )}
      </div>

      {/* Project Info Section */}
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Department</label>
            <Select
              value={formData.departmentId || ""}
              onValueChange={async (value) => {
                try {
                  setIsLoadingColor(true)
                  setFormData(prev => ({ ...prev, departmentId: value }))
                  clearError("departmentId")
                  
                  // Simulate API call delay
                  await new Promise(resolve => setTimeout(resolve, 300))
                } catch (error) {
                  console.error("Error loading department color:", error)
                  toast.error("Failed to load department color")
                } finally {
                  setIsLoadingColor(false)
                }
              }}
            >
              <SelectTrigger className={cn(errors["departmentId"] && "border-red-500")}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      />
                      {dept.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors["departmentId"] && (
              <p className="text-sm text-red-500 mt-1">{errors["departmentId"][0]}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Workflow</label>
            <Select
              value={formData.workflowId || ""}
              onValueChange={async (value) => {
                try {
                  setIsLoadingPhases(true)
                  setFormData(prev => ({
                    ...prev,
                    workflowId: value,
                    phaseId: undefined
                  }))
                  clearError("workflowId")
                  
                  // Simulate API call delay
                  await new Promise(resolve => setTimeout(resolve, 500))
                } catch (error) {
                  console.error("Error loading phases:", error)
                  toast.error("Failed to load workflow phases")
                } finally {
                  setIsLoadingPhases(false)
                }
              }}
            >
              <SelectTrigger className={cn(errors["workflowId"] && "border-red-500")}>
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
            {errors["workflowId"] && (
              <p className="text-sm text-red-500 mt-1">{errors["workflowId"][0]}</p>
            )}
          </div>
        </div>

        {formData.workflowId && (
          <div>
            <label className="text-sm font-medium">Phase</label>
            <Select
              value={formData.phaseId || ""}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, phaseId: value }))
                clearError("phaseId")
              }}
              disabled={isLoadingPhases}
            >
              <SelectTrigger 
                className={cn(
                  errors["phaseId"] && "border-red-500",
                  isLoadingPhases && "opacity-50 cursor-wait"
                )}
              >
                <SelectValue placeholder={isLoadingPhases ? "Loading phases..." : "Select phase"} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingPhases ? (
                  <div className="p-2 text-center">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : (
                  workflows
                    .find(w => w.id === formData.workflowId)
                    ?.phases.map((phase) => (
                      <SelectItem key={phase.id} value={phase.id}>
                        {phase.name}
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
            {errors["phaseId"] && (
              <p className="text-sm text-red-500 mt-1">{errors["phaseId"][0]}</p>
            )}
          </div>
        )}
      </Card>

      {/* Form Sections */}
      <div className="space-y-4">
        {formData.schema.sections.map((section, index) => (
          <Card key={section.id} className="p-0 overflow-hidden">
            <div className={cn(
              "flex items-center justify-between p-4 bg-gray-50",
              loadingSections[section.id] && "opacity-50"
            )}>
              <div className="flex items-center gap-2">
                <Select
                  value={section.type}
                  onValueChange={(value: FormSection["type"]) => 
                    handleSectionChange(section.id, "type", value)
                  }
                  disabled={loadingSections[section.id]}
                >
                  <SelectTrigger 
                    className={cn(
                      "w-[140px]",
                      errors[`schema.sections.${index}.type`] && "border-red-500"
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FORM">Form</SelectItem>
                    <SelectItem value="CHECKLIST">Checklist</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteSection(section.id)}
                  disabled={loadingSections[section.id]}
                >
                  {loadingSections[section.id] ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {section.type === "CHECKLIST" ? (
              <div>
                <div className="bg-black text-white p-2 text-center font-bold">
                  <Input
                    value={section.title}
                    onChange={(e) => {
                      handleSectionChange(section.id, "title", e.target.value)
                      clearError(`schema.sections.${index}.title`)
                    }}
                    className={cn(
                      "bg-transparent border-0 text-center text-white placeholder:text-white/70 focus-visible:ring-0",
                      errors[`schema.sections.${index}.title`] && "border-red-500"
                    )}
                    placeholder="TASKS"
                  />
                </div>
                {section.description && (
                  <p className="text-sm px-4 py-2">
                    {section.description}
                  </p>
                )}
                <div className="border-t border-gray-200">
                  <div className="border border-black">
                    {section.items.map((item, itemIndex) => (
                      <div key={item.id} className="flex border-b border-black last:border-b-0">
                        <div className="w-12 p-2 border-r border-black text-center font-bold">
                          {itemIndex + 1}
                        </div>
                        <div className="w-12 p-2 border-r border-black flex items-center justify-center">
                          <div 
                            className="w-6 h-6 border-2 border-black rounded-full cursor-pointer"
                          />
                        </div>
                        <div className="flex-1 p-2 text-sm flex items-center">
                          <div className="w-full">
                            <Input
                              value={item.content}
                              onChange={(e) => {
                                handleItemChange(section.id, item.id, "content", e.target.value)
                                clearError(`schema.sections.${index}.items.${itemIndex}.content`)
                              }}
                              className={cn(
                                "border-0 focus-visible:ring-0 p-0 text-sm",
                                errors[`schema.sections.${index}.items.${itemIndex}.content`] && "border-red-500"
                              )}
                              placeholder="Enter task description"
                            />
                            {errors[`schema.sections.${index}.items.${itemIndex}.content`] && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors[`schema.sections.${index}.items.${itemIndex}.content`][0]}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="p-2 flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteItem(section.id, item.id)}
                            className="h-6 w-6"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddChecklistItem(section.id)}
                      className="w-full"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <Input
                  className={cn(
                    "text-lg font-semibold w-full mb-4",
                    errors[`schema.sections.${index}.title`] && "border-red-500"
                  )}
                  value={section.title}
                  onChange={(e) => {
                    handleSectionChange(section.id, "title", e.target.value)
                    clearError(`schema.sections.${index}.title`)
                  }}
                  placeholder="Section Title"
                />
                <Textarea
                  className={cn(
                    "mb-4",
                    errors[`schema.sections.${index}.description`] && "border-red-500"
                  )}
                  placeholder="Section description (optional)"
                  value={section.description || ""}
                  onChange={(e) => {
                    handleSectionChange(section.id, "description", e.target.value)
                    clearError(`schema.sections.${index}.description`)
                  }}
                />
                {errors[`schema.sections.${index}.description`] && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[`schema.sections.${index}.description`][0]}
                  </p>
                )}
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={item.id} className="flex items-start gap-4">
                      <div className="flex-1">
                        <Input
                          value={item.content}
                          onChange={(e) => {
                            handleItemChange(section.id, item.id, "content", e.target.value)
                            clearError(`schema.sections.${index}.items.${itemIndex}.content`)
                          }}
                          className={cn(
                            errors[`schema.sections.${index}.items.${itemIndex}.content`] && "border-red-500"
                          )}
                        />
                        {errors[`schema.sections.${index}.items.${itemIndex}.content`] && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors[`schema.sections.${index}.items.${itemIndex}.content`][0]}
                          </p>
                        )}
                      </div>
                      <Select
                        value={item.type}
                        onValueChange={(value: FormItem["type"]) => {
                          handleItemChange(section.id, item.id, "type", value)
                          clearError(`schema.sections.${index}.items.${itemIndex}.type`)
                        }}
                      >
                        <SelectTrigger 
                          className={cn(
                            "w-[140px]",
                            errors[`schema.sections.${index}.items.${itemIndex}.type`] && "border-red-500"
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TEXT">Text</SelectItem>
                          <SelectItem value="TEXTAREA">Text Area</SelectItem>
                          <SelectItem value="SELECT">Select</SelectItem>
                          <SelectItem value="CHECKBOX">Checkbox</SelectItem>
                          <SelectItem value="RADIO">Radio</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors[`schema.sections.${index}.items.${itemIndex}.type`] && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors[`schema.sections.${index}.items.${itemIndex}.type`][0]}
                        </p>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(section.id, item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddItem(section.id)}
                    className="w-full"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={handleAddSection}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Section
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full relative"
        >
          {isSaving && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {isSaving ? "Saving..." : "Save Form"}
        </Button>
      </div>
    </div>
  )
} 