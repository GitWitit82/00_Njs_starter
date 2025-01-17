'use client'

import { useCallback, useState } from "react"
import { FormSchema } from "@/types/form"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash } from "lucide-react"

interface StandardFormTemplateProps {
  initialData?: FormSchema
  onSubmit: (data: FormSchema) => Promise<void>
  isLoading?: boolean
}

interface SectionUpdate {
  title?: string
  description?: string
}

interface ItemUpdate {
  type?: string
  label?: string
  required?: boolean
  options?: string[]
}

/**
 * StandardFormTemplate component for creating form templates
 * @param {StandardFormTemplateProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function StandardFormTemplate({
  initialData,
  onSubmit,
  isLoading = false,
}: StandardFormTemplateProps) {
  const [formData, setFormData] = useState<FormSchema>(
    initialData || {
      sections: [
        {
          id: crypto.randomUUID(),
          title: "",
          description: "",
          items: [],
        },
      ],
      metadata: {
        title: "",
        description: "",
      },
    }
  )

  const handleAddSection = useCallback(() => {
    const newSection = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      items: [],
    }
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }))
  }, [])

  const handleUpdateSection = useCallback(
    (index: number, updates: SectionUpdate) => {
      setFormData((prev) => ({
        ...prev,
        sections: prev.sections.map((section, i) =>
          i === index ? { ...section, ...updates } : section
        ),
      }))
    },
    []
  )

  const handleAddItem = useCallback(
    (sectionIndex: number) => {
      const newItem = {
        id: crypto.randomUUID(),
        type: "text",
        label: "",
        required: false,
        options: [],
      }
      setFormData((prev) => ({
        ...prev,
        sections: prev.sections.map((section, index) =>
          index === sectionIndex
            ? {
                ...section,
                items: [...section.items, newItem],
              }
            : section
        ),
      }))
    },
    []
  )

  const handleUpdateItem = useCallback(
    (sectionIndex: number, itemIndex: number, updates: ItemUpdate) => {
      setFormData((prev) => ({
        ...prev,
        sections: prev.sections.map((section, index) =>
          index === sectionIndex
            ? {
                ...section,
                items: section.items.map((item, i) =>
                  i === itemIndex ? { ...item, ...updates } : item
                ),
              }
            : section
        ),
      }))
    },
    []
  )

  const handleDeleteItem = useCallback(
    (sectionIndex: number, itemIndex: number) => {
      setFormData((prev) => ({
        ...prev,
        sections: prev.sections.map((section, index) =>
          index === sectionIndex
            ? {
                ...section,
                items: section.items.filter((_, i) => i !== itemIndex),
              }
            : section
        ),
      }))
    },
    []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="form-title">Form Title</Label>
            <Input
              id="form-title"
              value={formData.metadata.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  metadata: { ...prev.metadata, title: e.target.value },
                }))
              }
              placeholder="Enter form title"
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <Label htmlFor="form-description">Description</Label>
            <Textarea
              id="form-description"
              value={formData.metadata.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  metadata: { ...prev.metadata, description: e.target.value },
                }))
              }
              placeholder="Enter form description"
              disabled={isLoading}
            />
          </div>
        </div>
      </Card>

      {formData.sections.map((section, sectionIndex) => (
        <Card key={section.id} className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor={`section-${sectionIndex}-title`}>
                Section Title
              </Label>
              <Input
                id={`section-${sectionIndex}-title`}
                value={section.title}
                onChange={(e) =>
                  handleUpdateSection(sectionIndex, { title: e.target.value })
                }
                placeholder="Enter section title"
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label htmlFor={`section-${sectionIndex}-description`}>
                Description
              </Label>
              <Textarea
                id={`section-${sectionIndex}-description`}
                value={section.description}
                onChange={(e) =>
                  handleUpdateSection(sectionIndex, {
                    description: e.target.value,
                  })
                }
                placeholder="Enter section description"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-4">
              {section.items.map((item, itemIndex) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`item-${item.id}-type`}>Field Type</Label>
                        <Select
                          value={item.type}
                          onValueChange={(value) =>
                            handleUpdateItem(sectionIndex, itemIndex, {
                              type: value,
                            })
                          }
                          disabled={isLoading}
                        >
                          <SelectTrigger id={`item-${item.id}-type`}>
                            <SelectValue placeholder="Select field type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="textarea">Text Area</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`item-${item.id}-label`}>
                          Field Label
                        </Label>
                        <Input
                          id={`item-${item.id}-label`}
                          value={item.label}
                          onChange={(e) =>
                            handleUpdateItem(sectionIndex, itemIndex, {
                              label: e.target.value,
                            })
                          }
                          placeholder="Enter field label"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`item-${item.id}-required`}
                        checked={item.required}
                        onCheckedChange={(checked) =>
                          handleUpdateItem(sectionIndex, itemIndex, {
                            required: checked,
                          })
                        }
                        disabled={isLoading}
                      />
                      <Label htmlFor={`item-${item.id}-required`}>Required</Label>
                    </div>

                    {item.type === "select" && (
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {item.options?.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center space-x-2"
                          >
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(item.options || [])]
                                newOptions[optionIndex] = e.target.value
                                handleUpdateItem(sectionIndex, itemIndex, {
                                  options: newOptions,
                                })
                              }}
                              placeholder={`Option ${optionIndex + 1}`}
                              disabled={isLoading}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newOptions = (item.options || []).filter(
                                  (_, i) => i !== optionIndex
                                )
                                handleUpdateItem(sectionIndex, itemIndex, {
                                  options: newOptions,
                                })
                              }}
                              disabled={
                                isLoading || (item.options || []).length <= 1
                              }
                              aria-label={`Delete option ${optionIndex + 1}`}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newOptions = [...(item.options || []), ""]
                            handleUpdateItem(sectionIndex, itemIndex, {
                              options: newOptions,
                            })
                          }}
                          disabled={isLoading}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Option
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteItem(sectionIndex, itemIndex)}
                    disabled={isLoading}
                    aria-label={`Delete ${item.label || "field"}`}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddItem(sectionIndex)}
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddSection}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Form"}
        </Button>
      </div>
    </form>
  )
} 