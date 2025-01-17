'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import type { FormField, FormSection } from '@/types/forms'

interface FormSectionProps {
  section: FormSection
  onUpdate: (updates: Partial<FormSection>) => void
  onDelete: () => void
  onAddField: () => void
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void
  onDeleteField: (fieldId: string) => void
  onMoveField: (dragIndex: number, dropIndex: number) => void
}

export function FormSectionComponent({
  section,
  onUpdate,
  onDelete,
  onAddField,
  onUpdateField,
  onDeleteField,
  onMoveField
}: FormSectionProps) {
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedFieldIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedFieldIndex === null || draggedFieldIndex === index) return

    onMoveField(draggedFieldIndex, index)
    setDraggedFieldIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedFieldIndex(null)
  }

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'select', label: 'Select' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio' }
  ] as const

  return (
    <Card className="p-6">
      <div className="mb-6">
        <Input
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Section Title"
          className="mb-2 text-lg font-semibold"
        />
        <Textarea
          value={section.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Section Description"
          className="mt-2"
        />
      </div>

      <div className="space-y-4">
        {section.items.map((field, index) => (
          <div
            key={field.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className="flex items-start gap-4 rounded-lg border bg-card p-4"
          >
            <div className="mt-1 cursor-grab">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Field Label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) =>
                      onUpdateField(field.id, { label: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select
                    value={field.type}
                    onValueChange={(value) =>
                      onUpdateField(field.id, {
                        type: value as FormField['type']
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(field.type === 'select' || field.type === 'radio') && (
                <div className="space-y-2">
                  <Label>Options (one per line)</Label>
                  <Textarea
                    value={field.options?.join('\n') || ''}
                    onChange={(e) =>
                      onUpdateField(field.id, {
                        options: e.target.value.split('\n').filter(Boolean)
                      })
                    }
                    placeholder="Enter options..."
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`required-${field.id}`}
                  checked={field.required}
                  onCheckedChange={(checked) =>
                    onUpdateField(field.id, { required: !!checked })
                  }
                />
                <Label htmlFor={`required-${field.id}`}>Required field</Label>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteField(field.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between">
        <Button variant="outline" onClick={onAddField}>
          <Plus className="mr-2 h-4 w-4" />
          Add Field
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Section
        </Button>
      </div>
    </Card>
  )
} 