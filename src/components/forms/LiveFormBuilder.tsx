import { useState } from "react"
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
import { Label } from "@/components/ui/label"
import { nanoid } from "nanoid"

interface Section {
  id: string
  title: string
  description?: string
  type: "FORM" | "CHECKLIST"
  items: Array<{
    id: string
    content: string
    type?: string // For form fields: text, number, date, etc.
    required?: boolean
    options?: string[] // For select/radio fields
  }>
}

interface FormData {
  id?: string
  name: string
  description?: string
  departmentId: string
  departmentColor?: string
  workflowId?: string
  phaseId?: string
  type: "FORM" | "CHECKLIST"
  sections: Section[]
}

interface Department {
  id: string
  name: string
  color: string
}

interface Workflow {
  id: string
  name: string
  phases: Array<{
    id: string
    name: string
  }>
}

interface FormField {
  id: string
  type: "text" | "checkbox" | "radio" | "group"
  label: string
  required?: boolean
  options?: { id: string; label: string }[]
  fields?: FormField[] // For group type
}

interface FormSection {
  id: string
  title: string
  type: "FORM" | "CHECKLIST" | "GROUP" | "OPTIONS"
  fields: FormField[]
}

interface LiveFormBuilderProps {
  departments: Department[]
  workflows: Workflow[]
  initialData?: Partial<FormData>
  onSave: (data: FormData) => void
}

export function LiveFormBuilder({ departments, workflows, initialData, onSave }: LiveFormBuilderProps) {
  const [formData, setFormData] = useState<FormData>(() => ({
    name: initialData?.name || "",
    description: initialData?.description || "",
    departmentId: initialData?.departmentId || "",
    departmentColor: departments.find(d => d.id === initialData?.departmentId)?.color || "#004B93",
    workflowId: initialData?.workflowId || "",
    phaseId: initialData?.phaseId || "",
    type: initialData?.type || "FORM",
    sections: initialData?.sections || [],
  }))

  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | undefined>(
    workflows.find(w => w.id === formData.workflowId)
  )

  const handleDepartmentChange = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId)
    setFormData(prev => ({
      ...prev,
      departmentId,
      departmentColor: department?.color || "#004B93"
    }))
  }

  const handleWorkflowChange = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId)
    setSelectedWorkflow(workflow)
    setFormData(prev => ({
      ...prev,
      workflowId,
      phaseId: workflow?.phases[0]?.id || ""
    }))
  }

  const handlePhaseChange = (phaseId: string) => {
    setFormData(prev => ({
      ...prev,
      phaseId
    }))
  }

  const handleAddSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      title: "New Section",
      type: "FORM",
      items: []
    }
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
  }

  const handleUpdateSection = (sectionId: string, updates: Partial<Section>) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }))
  }

  const handleAddItem = (sectionId: string) => {
    const section = formData.sections.find(s => s.id === sectionId)
    if (!section) return

    const newItem = {
      id: crypto.randomUUID(),
      content: section.type === "CHECKLIST" ? "New Task" : "New Field",
      type: section.type === "CHECKLIST" ? undefined : "text"
    }

    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, items: [...section.items, newItem] }
          : section
      )
    }))
  }

  const handleUpdateItem = (sectionId: string, itemId: string, updates: Partial<any>) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
              )
            }
          : section
      )
    }))
  }

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, items: section.items.filter(item => item.id !== itemId) }
          : section
      )
    }))
  }

  const handleDeleteSection = (sectionId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }))
  }

  const handleAddField = (sectionId: string, type: FormField['type'] = 'text') => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id !== sectionId) return section

        const newField: FormField = {
          id: nanoid(),
          type,
          label: type === 'group' ? 'New Group' : 'New Field',
          required: false,
          ...(type === 'radio' && {
            options: [
              { id: nanoid(), label: 'Option 1' },
              { id: nanoid(), label: 'Option 2' }
            ]
          }),
          ...(type === 'group' && {
            fields: []
          })
        }

        return {
          ...section,
          fields: [...section.fields, newField]
        }
      })
    }))
  }

  const handleAddOption = (sectionId: string, fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id !== sectionId) return section

        return {
          ...section,
          fields: section.fields.map(field => {
            if (field.id !== fieldId) return field

            return {
              ...field,
              options: [
                ...(field.options || []),
                { id: nanoid(), label: `Option ${(field.options?.length || 0) + 1}` }
              ]
            }
          })
        }
      })
    }))
  }

  const renderField = (section: FormSection, field: FormField) => {
    switch (field.type) {
      case 'group':
        return (
          <div key={field.id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <Input
                value={field.label}
                onChange={(e) => handleUpdateField(section.id, field.id, { label: e.target.value })}
                className="font-bold"
                placeholder="Group Name"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddField(section.id, 'text')}
                >
                  Add Field
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteField(section.id, field.id)}
                  className="text-red-500"
                >
                  Delete Group
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {field.fields?.map(subField => renderField(section, subField))}
            </div>
          </div>
        )

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center gap-4">
              <Input
                value={field.label}
                onChange={(e) => handleUpdateField(section.id, field.id, { label: e.target.value })}
                placeholder="Radio Group Label"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddOption(section.id, field.id)}
              >
                Add Option
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteField(section.id, field.id)}
                className="text-red-500"
              >
                Delete
              </Button>
            </div>
            <div className="pl-4 space-y-2">
              {field.options?.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <input type="radio" disabled />
                  <Input
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...(field.options || [])]
                      newOptions[index] = { ...option, label: e.target.value }
                      handleUpdateField(section.id, field.id, { options: newOptions })
                    }}
                    placeholder="Option Label"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newOptions = field.options?.filter(o => o.id !== option.id)
                      handleUpdateField(section.id, field.id, { options: newOptions })
                    }}
                    className="text-red-500"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div key={field.id} className="flex items-center gap-4">
            <Input
              value={field.label}
              onChange={(e) => handleUpdateField(section.id, field.id, { label: e.target.value })}
              placeholder="Field Label"
            />
            <select
              value={field.type}
              onChange={(e) => handleUpdateField(section.id, field.id, { type: e.target.value as FormField['type'] })}
              className="border rounded p-2"
            >
              <option value="text">Text</option>
              <option value="checkbox">Checkbox</option>
              <option value="radio">Radio Group</option>
              <option value="group">Group</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteField(section.id, field.id)}
              className="text-red-500"
            >
              Delete
            </Button>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div 
        className="p-4 rounded-t-lg flex justify-between items-center"
        style={{ backgroundColor: formData.departmentColor }}
      >
        <div className="flex-1">
          <Label htmlFor="formName" className="sr-only">Form Name</Label>
          <Input
            id="formName"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter form name (required)"
            className={cn(
              "text-2xl font-bold bg-transparent text-white border-none placeholder:text-white/70",
              !formData.name && "placeholder:text-red-200"
            )}
            required
          />
        </div>
        <div className="flex gap-2">
          <div className="space-y-1">
            <Label htmlFor="department" className="sr-only">Department</Label>
            <Select 
              value={formData.departmentId} 
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger 
                id="department"
                className={cn(
                  "w-[200px] bg-white",
                  !formData.departmentId && "border-red-500"
                )}
              >
                <SelectValue placeholder="Select department (required)" />
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
          <div className="space-y-1">
            <Label htmlFor="workflow" className="sr-only">Workflow</Label>
            <Select value={formData.workflowId} onValueChange={handleWorkflowChange}>
              <SelectTrigger id="workflow" className="w-[200px] bg-white">
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
          </div>
          {selectedWorkflow && (
            <div className="space-y-1">
              <Label htmlFor="phase" className="sr-only">Phase</Label>
              <Select value={formData.phaseId} onValueChange={handlePhaseChange}>
                <SelectTrigger id="phase" className="w-[200px] bg-white">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  {selectedWorkflow.phases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Project Details Section */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Project Details</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="client">Client</Label>
            <Input id="client" disabled placeholder="Will be populated from project" />
          </div>
          <div>
            <Label htmlFor="project">Project</Label>
            <Input id="project" disabled placeholder="Will be populated from project" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" disabled placeholder="Auto-populated" />
          </div>
          <div>
            <Label htmlFor="vin">VIN Number</Label>
            <Input id="vin" disabled placeholder="From project" />
          </div>
          <div>
            <Label htmlFor="invoice">Invoice#</Label>
            <Input id="invoice" disabled placeholder="From project" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Description</h2>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter form description (optional)"
          className="min-h-[100px]"
        />
      </div>

      {/* Form Type */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Form Type</h2>
        <div className="space-y-1">
          <Label htmlFor="formType">Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value: "FORM" | "CHECKLIST") => 
              setFormData(prev => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger 
              id="formType"
              className={cn(
                "w-[200px]",
                !formData.type && "border-red-500"
              )}
            >
              <SelectValue placeholder="Select form type (required)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FORM">Form</SelectItem>
              <SelectItem value="CHECKLIST">Checklist</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sections */}
      {formData.sections.map((section) => (
        <div key={section.id} className="border rounded-lg">
          <div className="bg-black text-white p-4 rounded-t-lg flex justify-between items-center">
            <Input
              value={section.title}
              onChange={(e) => handleUpdateSection(section.id, { title: e.target.value })}
              className="text-lg font-semibold bg-transparent border-none text-white placeholder:text-white/70"
              placeholder="Section Title"
            />
            <div className="flex items-center gap-2">
              <Select
                value={section.type}
                onValueChange={(value: "FORM" | "CHECKLIST" | "GROUP" | "OPTIONS") => 
                  handleUpdateSection(section.id, { type: value, fields: [] })
                }
              >
                <SelectTrigger className="w-[150px] bg-white text-black">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FORM">Form</SelectItem>
                  <SelectItem value="CHECKLIST">Checklist</SelectItem>
                  <SelectItem value="GROUP">Group</SelectItem>
                  <SelectItem value="OPTIONS">Options</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => handleDeleteSection(section.id)}
                className="bg-white text-black hover:bg-red-500 hover:text-white"
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="p-4">
            {section.type === "CHECKLIST" ? (
              <div className="border border-black">
                {section.items.map((item, index) => (
                  <div key={item.id} className="flex border-b border-black last:border-b-0">
                    <div className="w-12 p-2 border-r border-black text-center font-bold">
                      {index + 1}
                    </div>
                    <div className="w-12 p-2 border-r border-black flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-black rounded-full" />
                    </div>
                    <div className="flex-1 p-2 flex items-center">
                      <Input
                        value={item.content}
                        onChange={(e) => handleUpdateItem(section.id, item.id, { content: e.target.value })}
                        className="border-none"
                        placeholder="Enter task description"
                      />
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteItem(section.id, item.id)}
                        className="ml-2 text-red-500"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.id} className="flex items-center gap-4">
                    <Input
                      value={field.label}
                      onChange={(e) => handleUpdateField(section.id, field.id, { label: e.target.value })}
                      placeholder="Field label"
                      className="flex-1"
                    />
                    <Select
                      value={field.type}
                      onValueChange={(value) => handleUpdateField(section.id, field.id, { type: value })}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Field type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteField(section.id, field.id)}
                      className="text-red-500"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => handleAddField(section.id)}
              className="mt-4"
            >
              Add {section.type === "CHECKLIST" ? "Task" : "Field"}
            </Button>
          </div>
        </div>
      ))}

      <div className="flex justify-between">
        <Button onClick={handleAddSection}>Add Section</Button>
        <Button onClick={() => onSave(formData)} className="bg-green-600 hover:bg-green-700">
          Save Form
        </Button>
      </div>
    </div>
  )
} 