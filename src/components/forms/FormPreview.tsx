"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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

/**
 * Form preview component for rendering a form template
 */
export function FormPreview({ schema, layout, style }) {
  const [formData, setFormData] = useState({})

  /**
   * Handle form field changes
   */
  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  /**
   * Render a form field based on its type
   */
  const renderField = (field: any) => {
    switch (field.type) {
      case "TEXT":
      case "EMAIL":
      case "PASSWORD":
        return (
          <Input
            type={field.type.toLowerCase()}
            id={field.id}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.validation?.required}
          />
        )
      case "TEXTAREA":
        return (
          <Textarea
            id={field.id}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.validation?.required}
          />
        )
      case "NUMBER":
        return (
          <Input
            type="number"
            id={field.id}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.validation?.required}
          />
        )
      case "DATE":
      case "TIME":
      case "DATETIME":
        return (
          <Input
            type={field.type.toLowerCase()}
            id={field.id}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.validation?.required}
          />
        )
      case "CHECKBOX":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.id}
              name={field.name}
              checked={formData[field.name] || false}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              required={field.validation?.required}
              className="h-4 w-4"
            />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        )
      case "RADIO":
        return (
          <div className="space-y-2">
            {field.options?.map((option: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.id}-${index}`}
                  name={field.name}
                  value={option.value}
                  checked={formData[field.name] === option.value}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  required={field.validation?.required}
                  className="h-4 w-4"
                />
                <Label htmlFor={`${field.id}-${index}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        )
      case "SELECT":
      case "MULTISELECT":
        return (
          <Select
            value={formData[field.name] || ""}
            onValueChange={(value) => handleFieldChange(field.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: any, index: number) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      default:
        return null
    }
  }

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form data:", formData)
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {schema.sections.map((section: any, sectionIndex: number) => (
          <div key={section.id} className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{section.title}</h3>
              {section.description && (
                <p className="text-sm text-gray-500">{section.description}</p>
              )}
            </div>

            <div className="grid gap-4">
              {section.fields.map((field: any, fieldIndex: number) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.validation?.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Card>
  )
} 