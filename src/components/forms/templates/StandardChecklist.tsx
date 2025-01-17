'use client'

import { useCallback, useState } from "react"
import { FormSchema } from "@/types/form"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash } from "lucide-react"

interface StandardChecklistProps {
  initialData?: FormSchema
  onSubmit: (data: FormSchema) => Promise<void>
  isLoading?: boolean
}

interface ChecklistItem {
  id: string
  label: string
  required: boolean
}

interface ChecklistSection {
  id: string
  title: string
  description: string
  items: ChecklistItem[]
}

interface ChecklistData {
  sections: ChecklistSection[]
  metadata: {
    title: string
    description: string
  }
}

/**
 * StandardChecklist component for creating checklist templates
 * @param {StandardChecklistProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function StandardChecklist({
  initialData,
  onSubmit,
  isLoading = false,
}: StandardChecklistProps) {
  const [formData, setFormData] = useState<ChecklistData>(
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
    const newSection: ChecklistSection = {
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
    (index: number, updates: Partial<ChecklistSection>) => {
      setFormData((prev) => ({
        ...prev,
        sections: prev.sections.map((section, i) =>
          i === index ? { ...section, ...updates } : section
        ),
      }))
    },
    []
  )

  const handleDeleteSection = useCallback(
    (index: number) => {
      setFormData((prev) => ({
        ...prev,
        sections: prev.sections.filter((_, i) => i !== index),
      }))
    },
    []
  )

  const handleAddItem = useCallback(
    (sectionIndex: number) => {
      const newItem: ChecklistItem = {
        id: crypto.randomUUID(),
        label: "",
        required: false,
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
    (sectionIndex: number, itemIndex: number, updates: Partial<ChecklistItem>) => {
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
    await onSubmit(formData as unknown as FormSchema)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="form-title">Checklist Title</Label>
            <Input
              id="form-title"
              value={formData.metadata.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  metadata: { ...prev.metadata, title: e.target.value },
                }))
              }
              placeholder="Enter checklist title"
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
              placeholder="Enter checklist description"
              disabled={isLoading}
            />
          </div>
        </div>
      </Card>

      {formData.sections.map((section, sectionIndex) => (
        <Card key={section.id} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteSection(sectionIndex)}
                disabled={isLoading || formData.sections.length <= 1}
                aria-label={`Delete ${section.title || "section"}`}
              >
                <Trash className="h-4 w-4" />
              </Button>
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
                  <div className="flex-1">
                    <Label htmlFor={`item-${item.id}-label`}>Item Label</Label>
                    <Input
                      id={`item-${item.id}-label`}
                      value={item.label}
                      onChange={(e) =>
                        handleUpdateItem(sectionIndex, itemIndex, {
                          label: e.target.value,
                        })
                      }
                      placeholder="Enter item label"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteItem(sectionIndex, itemIndex)}
                    disabled={isLoading}
                    aria-label={`Delete ${item.label || "item"}`}
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
                Add Item
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
          {isLoading ? "Saving..." : "Save Checklist"}
        </Button>
      </div>
    </form>
  )
} 