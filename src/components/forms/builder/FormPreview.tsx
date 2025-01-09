"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Field {
  id: string
  label: string
  type: string
  required: boolean
  options?: any[]
}

interface Section {
  id: string
  title: string
  description: string
  fields: Field[]
}

interface FormSchema {
  sections: Section[]
}

interface FormData {
  id?: string
  name: string
  description: string
  type: string
  departmentId: string
  workflowId?: string
  phaseId?: string
  schema: FormSchema
  layout: Record<string, any>
  style: Record<string, any>
  metadata: Record<string, any>
  order: number
  isActive: boolean
}

interface FormPreviewProps {
  formData: FormData
  departments?: {
    id: string
    name: string
    color: string
  }[]
}

export function FormPreview({ formData, departments = [] }: FormPreviewProps) {
  const departmentColor = departments.find(d => d.id === formData.departmentId)?.color || "#004B93"

  const renderField = (field: Field) => {
    switch (field.type) {
      case "text":
      case "email":
      case "tel":
      case "number":
      case "date":
      case "time":
      case "datetime-local":
        return (
          <Input
            type={field.type}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        )
      case "textarea":
        return (
          <Textarea
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        )
      case "select":
        return (
          <Select>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              required={field.required}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span>{field.label}</span>
          </div>
        )
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  required={field.required}
                  className="h-4 w-4 border-gray-300"
                />
                <span>{option}</span>
              </div>
            ))}
          </div>
        )
      case "file":
        return (
          <Input
            type="file"
            required={field.required}
            accept={field.options?.join(",")}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div 
        className="p-4 rounded-t-lg"
        style={{ backgroundColor: departmentColor }}
      >
        <h1 className="text-2xl font-bold text-white">{formData.name}</h1>
        {formData.description && (
          <p className="text-gray-100 mt-1">{formData.description}</p>
        )}
      </div>

      <form className="space-y-8">
        {formData.schema.sections.map((section) => (
          <Card key={section.id} className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium">{section.title}</h2>
                {section.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {section.description}
                  </p>
                )}
              </div>

              <div className="grid gap-6">
                {section.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </form>
    </div>
  )
} 