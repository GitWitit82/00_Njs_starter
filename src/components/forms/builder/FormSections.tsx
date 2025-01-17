"use client"

import { useCallback } from "react"
import { FormSection } from "@/types/form"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormItems } from "./FormItems"
import { Plus, Trash } from "lucide-react"

interface FormSectionsProps {
  sections: FormSection[]
  onChange: (sections: FormSection[]) => void
  disabled?: boolean
}

/**
 * FormSections component for managing form sections
 * @param {FormSectionsProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function FormSections({
  sections,
  onChange,
  disabled = false,
}: FormSectionsProps) {
  const handleAddSection = useCallback(() => {
    const newSection: FormSection = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      items: [],
    }
    onChange([...sections, newSection])
  }, [sections, onChange])

  const handleUpdateSection = useCallback(
    (index: number, updates: Partial<FormSection>) => {
      const updatedSections = sections.map((section, i) =>
        i === index ? { ...section, ...updates } : section
      )
      onChange(updatedSections)
    },
    [sections, onChange]
  )

  const handleDeleteSection = useCallback(
    (index: number) => {
      const updatedSections = sections.filter((_, i) => i !== index)
      onChange(updatedSections)
    },
    [sections, onChange]
  )

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <Card key={section.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor={`section-${index}-title`}>Section Title</Label>
                <Input
                  id={`section-${index}-title`}
                  value={section.title}
                  onChange={(e) =>
                    handleUpdateSection(index, { title: e.target.value })
                  }
                  placeholder="Enter section title"
                  disabled={disabled}
                  required
                  aria-label="Section title"
                />
              </div>
              <div>
                <Label htmlFor={`section-${index}-description`}>
                  Description (Optional)
                </Label>
                <Textarea
                  id={`section-${index}-description`}
                  value={section.description}
                  onChange={(e) =>
                    handleUpdateSection(index, { description: e.target.value })
                  }
                  placeholder="Enter section description"
                  disabled={disabled}
                  aria-label="Section description"
                />
              </div>
              <FormItems
                items={section.items}
                onChange={(items) => handleUpdateSection(index, { items })}
                disabled={disabled}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteSection(index)}
              disabled={disabled}
              aria-label="Delete section"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
      <Button
        onClick={handleAddSection}
        disabled={disabled}
        aria-label="Add new section"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Section
      </Button>
    </div>
  )
} 