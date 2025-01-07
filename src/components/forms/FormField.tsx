"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

const FIELD_TYPES = [
  { value: "TEXT", label: "Text" },
  { value: "TEXTAREA", label: "Text Area" },
  { value: "NUMBER", label: "Number" },
  { value: "EMAIL", label: "Email" },
  { value: "PASSWORD", label: "Password" },
  { value: "DATE", label: "Date" },
  { value: "TIME", label: "Time" },
  { value: "DATETIME", label: "Date & Time" },
  { value: "CHECKBOX", label: "Checkbox" },
  { value: "RADIO", label: "Radio" },
  { value: "SELECT", label: "Select" },
  { value: "MULTISELECT", label: "Multi Select" },
  { value: "FILE", label: "File Upload" },
  { value: "IMAGE", label: "Image Upload" },
  { value: "SIGNATURE", label: "Signature" },
  { value: "CUSTOM", label: "Custom" },
]

/**
 * Form field component for configuring individual form fields
 */
export function FormField({ field, onUpdate, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(true)

  /**
   * Add a new option to the field
   */
  const handleAddOption = () => {
    const newOption = {
      label: "New Option",
      value: `option_${crypto.randomUUID()}`,
    }

    onUpdate({
      ...field,
      options: [...(field.options || []), newOption],
    })
  }

  /**
   * Update an option in the field
   */
  const handleUpdateOption = (index: number, updates: any) => {
    onUpdate({
      ...field,
      options: field.options.map((option, i) =>
        i === index ? { ...option, ...updates } : option
      ),
    })
  }

  /**
   * Delete an option from the field
   */
  const handleDeleteOption = (index: number) => {
    onUpdate({
      ...field,
      options: field.options.filter((_, i) => i !== index),
    })
  }

  /**
   * Render the field preview based on its type
   */
  const renderFieldPreview = () => {
    switch (field.type) {
      case "TEXT":
      case "EMAIL":
      case "PASSWORD":
        return (
          <Input
            type={field.type.toLowerCase()}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            disabled
          />
        )
      case "TEXTAREA":
        return (
          <Textarea
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            disabled
          />
        )
      case "NUMBER":
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            disabled
          />
        )
      case "DATE":
      case "TIME":
      case "DATETIME":
        return (
          <Input
            type={field.type.toLowerCase()}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            disabled
          />
        )
      case "CHECKBOX":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={field.defaultValue}
              disabled
              className="h-4 w-4"
            />
            <span>{field.label}</span>
          </div>
        )
      case "RADIO":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={field.defaultValue === option.value}
                  disabled
                  className="h-4 w-4"
                />
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        )
      case "SELECT":
      case "MULTISELECT":
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
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

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex items-center space-x-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="text-lg font-medium">{field.label}</span>
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
          <Button variant="destructive" onClick={onDelete}>
            Delete Field
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`field-${field.id}-type`}>Type</Label>
                <Select
                  value={field.type}
                  onValueChange={(value) => onUpdate({ ...field, type: value })}
                >
                  <SelectTrigger id={`field-${field.id}-type`}>
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`field-${field.id}-name`}>Name</Label>
                <Input
                  id={`field-${field.id}-name`}
                  value={field.name}
                  onChange={(e) =>
                    onUpdate({ ...field, name: e.target.value })
                  }
                  placeholder="Enter field name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`field-${field.id}-label`}>Label</Label>
              <Input
                id={`field-${field.id}-label`}
                value={field.label}
                onChange={(e) =>
                  onUpdate({ ...field, label: e.target.value })
                }
                placeholder="Enter field label"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`field-${field.id}-placeholder`}>
                Placeholder
              </Label>
              <Input
                id={`field-${field.id}-placeholder`}
                value={field.placeholder}
                onChange={(e) =>
                  onUpdate({ ...field, placeholder: e.target.value })
                }
                placeholder="Enter field placeholder"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`field-${field.id}-default`}>
                Default Value
              </Label>
              <Input
                id={`field-${field.id}-default`}
                value={field.defaultValue}
                onChange={(e) =>
                  onUpdate({ ...field, defaultValue: e.target.value })
                }
                placeholder="Enter default value"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id={`field-${field.id}-required`}
                checked={field.validation?.required}
                onCheckedChange={(checked) =>
                  onUpdate({
                    ...field,
                    validation: {
                      ...field.validation,
                      required: checked,
                    },
                  })
                }
              />
              <Label htmlFor={`field-${field.id}-required`}>Required</Label>
            </div>

            {(field.type === "SELECT" ||
              field.type === "MULTISELECT" ||
              field.type === "RADIO") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button variant="outline" onClick={handleAddOption}>
                    Add Option
                  </Button>
                </div>
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option.label}
                      onChange={(e) =>
                        handleUpdateOption(index, {
                          ...option,
                          label: e.target.value,
                        })
                      }
                      placeholder="Option label"
                    />
                    <Input
                      value={option.value}
                      onChange={(e) =>
                        handleUpdateOption(index, {
                          ...option,
                          value: e.target.value,
                        })
                      }
                      placeholder="Option value"
                    />
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteOption(index)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-4">
              <Label>Preview</Label>
              <div className="mt-2">{renderFieldPreview()}</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 