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
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { FormFieldType } from "@prisma/client"

interface FormFieldProps {
  id?: string
  type?: FormFieldType | string
  label?: string
  required?: boolean
  placeholder?: string
  helpText?: string
  options?: { label: string; value: string }[]
  validation?: Record<string, any>
  value?: any
  onChange?: (value: any) => void
  onUpdate?: (field: any) => void
  onDelete?: () => void
  className?: string
  isEditing?: boolean
}

/**
 * FormField component that handles different field types and their configurations
 * Supports both form building and form rendering modes
 */
export function FormField({
  id,
  type = "TEXT",
  label,
  required = false,
  placeholder,
  helpText,
  options = [],
  validation = {},
  value,
  onChange,
  onUpdate,
  onDelete,
  className,
  isEditing = false,
}: FormFieldProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  /**
   * Renders the appropriate input component based on field type
   */
  const renderInput = () => {
    switch (type) {
      case "TEXTAREA":
        return (
          <Textarea
            id={id}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="min-h-[100px]"
          />
        )

      case "NUMBER":
        return (
          <Input
            type="number"
            id={id}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            {...validation}
          />
        )

      case "CHECKBOX":
        return (
          <Checkbox
            id={id}
            checked={value}
            onCheckedChange={onChange}
          />
        )

      case "RADIO":
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${id}-${option.value}`}
                  name={id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange?.(e.target.value)}
                  className="h-4 w-4"
                />
                <Label htmlFor={`${id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        )

      case "SELECT":
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "DATE":
        return (
          <Input
            type="date"
            id={id}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
          />
        )

      case "TIME":
        return (
          <Input
            type="time"
            id={id}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
          />
        )

      case "DATETIME":
        return (
          <Input
            type="datetime-local"
            id={id}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
          />
        )

      case "CUSTOM":
        return (
          <div className="space-y-2">
            <Textarea
              value={value?.content || ""}
              onChange={(e) =>
                onChange?.({ ...value, content: e.target.value })
              }
              placeholder="Custom field content"
              className="min-h-[100px]"
            />
            <Input
              type="text"
              value={value?.format || ""}
              onChange={(e) =>
                onChange?.({ ...value, format: e.target.value })
              }
              placeholder="Custom format (e.g., regex pattern)"
            />
          </div>
        )

      default:
        return (
          <Input
            type="text"
            id={id}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            {...validation}
          />
        )
    }
  }

  /**
   * Renders the field configuration panel when in editing mode
   */
  const renderConfig = () => {
    if (!isEditing) return null

    return (
      <div className="space-y-4 border-t pt-4 mt-4">
        <div className="flex items-center justify-between">
          <Label>Field Type</Label>
          <Select
            value={type}
            onValueChange={(value) =>
              onUpdate?.({ id, type: value, label, required, placeholder, helpText, options, validation })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(FormFieldType).map((fieldType) => (
                <SelectItem key={fieldType} value={fieldType}>
                  {fieldType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Label</Label>
          <Input
            value={label}
            onChange={(e) =>
              onUpdate?.({ id, type, label: e.target.value, required, placeholder, helpText, options, validation })
            }
            placeholder="Field label"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={required}
            onCheckedChange={(checked) =>
              onUpdate?.({ id, type, label, required: checked, placeholder, helpText, options, validation })
            }
          />
          <Label>Required</Label>
        </div>

        <div className="space-y-2">
          <Label>Placeholder</Label>
          <Input
            value={placeholder}
            onChange={(e) =>
              onUpdate?.({ id, type, label, required, placeholder: e.target.value, helpText, options, validation })
            }
            placeholder="Field placeholder"
          />
        </div>

        <div className="space-y-2">
          <Label>Help Text</Label>
          <Input
            value={helpText}
            onChange={(e) =>
              onUpdate?.({ id, type, label, required, placeholder, helpText: e.target.value, options, validation })
            }
            placeholder="Help text"
          />
        </div>

        {(type === "SELECT" || type === "RADIO") && (
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...options]
                      newOptions[index] = { ...option, label: e.target.value }
                      onUpdate?.({ id, type, label, required, placeholder, helpText, options: newOptions, validation })
                    }}
                    placeholder="Option label"
                  />
                  <Input
                    value={option.value}
                    onChange={(e) => {
                      const newOptions = [...options]
                      newOptions[index] = { ...option, value: e.target.value }
                      onUpdate?.({ id, type, label, required, placeholder, helpText, options: newOptions, validation })
                    }}
                    placeholder="Option value"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newOptions = options.filter((_, i) => i !== index)
                      onUpdate?.({ id, type, label, required, placeholder, helpText, options: newOptions, validation })
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newOptions = [...options, { label: "", value: "" }]
                  onUpdate?.({ id, type, label, required, placeholder, helpText, options: newOptions, validation })
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

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {label && (
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
          {helpText && <p className="text-sm text-gray-500">{helpText}</p>}
        </div>
        {isEditing && (
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
            >
              Configure
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {renderInput()}
      {isConfigOpen && renderConfig()}
    </div>
  )
} 