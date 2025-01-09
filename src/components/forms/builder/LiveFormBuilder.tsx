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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"
import { SplitViewLayout } from "./SplitViewLayout"
import { FormPreview } from "./FormPreview"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FormSections } from "./FormSections"

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

interface FormItemLayout {
  width: "full" | "half" | "third"
  row: number
}

interface FormItemWithLayout extends FormItem {
  layout: FormItemLayout
}

type FieldType = "TEXT" | "TEXTAREA" | "SELECT" | "CHECKBOX" | "RADIO" | "CHECKLIST";
type TextAreaSize = "small" | "normal" | "large";

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
    sections: [],
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
  const [openSection, setOpenSection] = useState<string | null>(null)

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
          sections: [],
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
          sections: (templateData.schema as { sections: FormSection[] })?.sections || [],
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
        sections: [
          ...prev.sections,
          {
            id: sectionId,
            title: "New Section",
            description: "",
            items: [{
              id: crypto.randomUUID(),
              content: "New Field",
              type: "TEXT",
              required: false,
              layout: {
                width: "full",
                row: 0
              }
            }]
          }
        ]
      }))
      // Set the new section as the open one
      setOpenSection(sectionId)
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
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: [
                ...section.items,
                {
                  id: crypto.randomUUID(),
                  content: "New Field",
                  type: "TEXT",
                  required: false,
                  options: [],
                  size: "normal",
                  layout: {
                    width: "full",
                    row: section.items.length
                  }
                }
              ]
            }
          : section
      )
    }))
  }

  const handleItemTypeChange = (sectionId: string, itemId: string, type: FieldType) => {
    clearAllErrors()
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId
                  ? {
                      ...item,
                      type,
                      options: type === "CHECKLIST" ? ["Task 1"] : [],
                      size: type === "TEXTAREA" ? "normal" as TextAreaSize : undefined
                    }
                  : item
              )
            }
          : section
      )
    }))
  }

  const handleItemWidthChange = (sectionId: string, itemId: string, width: "full" | "half" | "third") => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId
                  ? {
                      ...item,
                      layout: { ...item.layout, width }
                    }
                  : item
              )
            }
          : section
      )
    }))
  }

  const handleAddOption = (sectionId: string, itemId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId
                  ? {
                      ...item,
                      options: [
                        ...(item.options || []),
                        item.type === "CHECKLIST" 
                          ? `Task ${(item.options || []).length + 1}`
                          : `Option ${(item.options || []).length + 1}`
                      ]
                    }
                  : item
              )
            }
          : section
      )
    }))
  }

  const handleUpdateOption = (sectionId: string, itemId: string, optionIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId
                  ? {
                      ...item,
                      options: item.options?.map((opt, idx) =>
                        idx === optionIndex ? value : opt
                      )
                    }
                  : item
              )
            }
          : section
      )
    }))
  }

  const handleDeleteOption = (sectionId: string, itemId: string, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId
                  ? {
                      ...item,
                      options: item.options?.filter((_, idx) => idx !== optionIndex)
                    }
                  : item
              )
            }
          : section
      )
    }))
  }

  const handleTextAreaSizeChange = (sectionId: string, itemId: string, size: TextAreaSize) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId
                  ? { ...item, size }
                  : item
              )
            }
          : section
      )
    }))
  }

  const handleSectionChange = (sectionId: string, field: "title" | "description", value: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, [field]: value }
          : section
      )
    }))
  }

  const handleItemChange = (
    sectionId: string, 
    itemId: string, 
    field: "content" | "type" | "required" | "options" | "size" | "layout", 
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
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
        sections: prev.sections.filter(section => section.id !== sectionId)
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
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter(item => item.id !== itemId)
            }
          : section
      )
    }))
  }

  const handleAddChecklistItem = (sectionId: string) => {
    clearAllErrors()
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: [
                ...section.items,
                {
                  id: crypto.randomUUID(),
                  content: "New Task",
                  type: "CHECKLIST",
                  required: false,
                  options: ["New Task"],
                  layout: {
                    width: "full",
                    row: section.items.length
                  }
                }
              ]
            }
          : section
      )
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

  const builderContent = (
    <div className="space-y-6">
      {/* Form Header */}
      <Accordion type="single" collapsible defaultValue="form-details" className="border rounded-lg">
        <AccordionItem value="form-details" className="border-none">
          <AccordionTrigger className="text-lg font-semibold px-6 py-4">Form Details</AccordionTrigger>
          <AccordionContent className="border-t">
            <div className="space-y-4 px-6 py-4">
              <div className="space-y-2">
                <Label>Form Name</Label>
                <Input
                  className={cn(
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
                  <p className="text-sm text-red-500">{errors["name"][0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  className={cn(
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
                  <p className="text-sm text-red-500">{errors["description"][0]}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
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
                    <p className="text-sm text-red-500">{errors["departmentId"][0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Workflow</Label>
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
                    <p className="text-sm text-red-500">{errors["workflowId"][0]}</p>
                  )}
                </div>
              </div>

              {formData.workflowId && (
                <div className="space-y-2">
                  <Label>Phase</Label>
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
                    <p className="text-sm text-red-500">{errors["phaseId"][0]}</p>
                  )}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Form Sections */}
      <FormSections
        sections={formData.sections}
        errors={errors}
        loadingSections={loadingSections}
        onSectionChange={handleSectionChange}
        onDeleteSection={handleDeleteSection}
        onAddItem={handleAddItem}
        onItemChange={handleItemChange}
        onDeleteItem={handleDeleteItem}
        onItemTypeChange={handleItemTypeChange}
        onItemWidthChange={handleItemWidthChange}
        onAddOption={handleAddOption}
        onUpdateOption={handleUpdateOption}
        onDeleteOption={handleDeleteOption}
        onTextAreaSizeChange={handleTextAreaSizeChange}
        clearError={clearError}
      />

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

  return (
    <SplitViewLayout
      builder={builderContent}
      preview={<FormPreview formData={formData} departments={departments} />}
    />
  )
} 