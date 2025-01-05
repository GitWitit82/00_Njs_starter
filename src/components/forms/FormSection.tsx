"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface FormSectionProps {
  section: {
    id: string
    title: string
    description?: string
    fields: string[]
  }
  fields: any[]
  onUpdate: (section: any) => void
  onDelete: () => void
  className?: string
}

/**
 * FormSection component for grouping and organizing form fields
 * Supports drag and drop reordering of fields within sections
 */
export function FormSection({
  section,
  fields,
  onUpdate,
  onDelete,
  className,
}: FormSectionProps) {
  const [isEditing, setIsEditing] = useState(false)

  /**
   * Handles reordering of fields within the section
   */
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(section.fields)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onUpdate({
      ...section,
      fields: items,
    })
  }

  /**
   * Renders the section configuration panel
   */
  const renderConfig = () => {
    if (!isEditing) return null

    return (
      <div className="space-y-4 border-t pt-4 mt-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={section.title}
            onChange={(e) =>
              onUpdate({ ...section, title: e.target.value })
            }
            placeholder="Section title"
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={section.description}
            onChange={(e) =>
              onUpdate({ ...section, description: e.target.value })
            }
            placeholder="Section description"
          />
        </div>

        <div className="space-y-2">
          <Label>Fields</Label>
          <Select
            value=""
            onValueChange={(value) => {
              if (!section.fields.includes(value)) {
                onUpdate({
                  ...section,
                  fields: [...section.fields, value],
                })
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Add field to section" />
            </SelectTrigger>
            <SelectContent>
              {fields
                .filter((field) => !section.fields.includes(field.id))
                .map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.label || field.id}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-lg font-medium">{section.title}</h4>
          {section.description && (
            <p className="text-sm text-gray-500">{section.description}</p>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Done" : "Edit"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={section.id}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4 mt-4"
            >
              {section.fields.map((fieldId, index) => {
                const field = fields.find((f) => f.id === fieldId)
                if (!field) return null

                return (
                  <Draggable
                    key={fieldId}
                    draggableId={fieldId}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white rounded-lg p-2 border"
                      >
                        <div className="flex items-center justify-between">
                          <span>{field.label || field.id}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onUpdate({
                                ...section,
                                fields: section.fields.filter((id) => id !== fieldId),
                              })
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {renderConfig()}
    </Card>
  )
} 