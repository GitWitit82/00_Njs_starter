"use client"

import { Button } from "@/components/ui/button"
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

interface Field {
  id: string
  label: string
  type: string
  required: boolean
  options?: any[]
}

interface FormFieldProps {
  field: Field
  onUpdate: (updates: Partial<Field>) => void
  onDelete: () => void
}

export function FormField({ field, onUpdate, onDelete }: FormFieldProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor={`field-${field.id}-label`}>Field Label</Label>
          <Input
            id={`field-${field.id}-label`}
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Enter field label"
          />
        </div>
        <Button variant="destructive" onClick={onDelete}>
          Delete Field
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor={`field-${field.id}-type`}>Field Type</Label>
          <Select
            value={field.type}
            onValueChange={(value) => onUpdate({ type: value })}
          >
            <SelectTrigger id={`field-${field.id}-type`}>
              <SelectValue placeholder="Select field type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="tel">Phone</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="time">Time</SelectItem>
              <SelectItem value="datetime-local">Date & Time</SelectItem>
              <SelectItem value="textarea">Text Area</SelectItem>
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
              <SelectItem value="radio">Radio</SelectItem>
              <SelectItem value="file">File</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id={`field-${field.id}-required`}
            checked={field.required}
            onCheckedChange={(checked) => onUpdate({ required: checked })}
          />
          <Label htmlFor={`field-${field.id}-required`}>Required</Label>
        </div>
      </div>

      {(field.type === "select" || field.type === "radio") && (
        <div className="space-y-2">
          <Label>Options</Label>
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(field.options || [])]
                    newOptions[index] = e.target.value
                    onUpdate({ options: newOptions })
                  }}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const newOptions = [...(field.options || [])]
                    newOptions.splice(index, 1)
                    onUpdate({ options: newOptions })
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const newOptions = [...(field.options || []), ""]
                onUpdate({ options: newOptions })
              }}
            >
              Add Option
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 