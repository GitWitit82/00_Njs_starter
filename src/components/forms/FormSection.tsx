import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FormField } from "./FormField"

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

interface FormSectionProps {
  section: Section
  onUpdate: (updates: Partial<Section>) => void
  onDelete: () => void
  onAddField: () => void
  onUpdateField: (fieldId: string, updates: Partial<Field>) => void
  onDeleteField: (fieldId: string) => void
}

export function FormSection({
  section,
  onUpdate,
  onDelete,
  onAddField,
  onUpdateField,
  onDeleteField,
}: FormSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex items-center space-x-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="text-lg font-medium">{section.title}</span>
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
          <div className="space-x-2">
            <Button variant="outline" onClick={onAddField}>
              Add Field
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete Section
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor={`section-${section.id}-title`}>Title</Label>
                <Input
                  id={`section-${section.id}-title`}
                  value={section.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  placeholder="Enter section title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`section-${section.id}-description`}>
                  Description
                </Label>
                <Textarea
                  id={`section-${section.id}-description`}
                  value={section.description}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  placeholder="Enter section description"
                />
              </div>
            </div>

            <div className="space-y-4">
              {section.fields.map((field) => (
                <FormField
                  key={field.id}
                  field={field}
                  onUpdate={(updates) => onUpdateField(field.id, updates)}
                  onDelete={() => onDeleteField(field.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 