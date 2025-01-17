import { useCallback } from "react"
import { FormItem } from "@/types/form"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash } from "lucide-react"

const FIELD_TYPES = {
  TEXT: "text",
  TEXTAREA: "textarea",
  NUMBER: "number",
  CHECKBOX: "checkbox",
  SELECT: "select",
  DATE: "date",
} as const

type FieldType = typeof FIELD_TYPES[keyof typeof FIELD_TYPES]

interface FormItemsProps {
  items: FormItem[]
  onChange: (items: FormItem[]) => void
  disabled?: boolean
}

/**
 * FormItems component for managing form items within a section
 * @param {FormItemsProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function FormItems({
  items,
  onChange,
  disabled = false,
}: FormItemsProps) {
  const handleAddItem = useCallback(() => {
    const newItem: FormItem = {
      id: crypto.randomUUID(),
      type: FIELD_TYPES.TEXT,
      label: "",
      required: false,
      options: [],
    }
    onChange([...items, newItem])
  }, [items, onChange])

  const handleUpdateItem = useCallback(
    (index: number, updates: Partial<FormItem>) => {
      const updatedItems = items.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      )
      onChange(updatedItems)
    },
    [items, onChange]
  )

  const handleDeleteItem = useCallback(
    (index: number) => {
      const updatedItems = items.filter((_, i) => i !== index)
      onChange(updatedItems)
    },
    [items, onChange]
  )

  const handleAddOption = useCallback(
    (index: number) => {
      const item = items[index]
      if (item.type === FIELD_TYPES.SELECT) {
        const options = [...(item.options || []), ""]
        handleUpdateItem(index, { options })
      }
    },
    [items, handleUpdateItem]
  )

  const handleUpdateOption = useCallback(
    (itemIndex: number, optionIndex: number, value: string) => {
      const item = items[itemIndex]
      if (item.type === FIELD_TYPES.SELECT && item.options) {
        const options = item.options.map((opt, i) =>
          i === optionIndex ? value : opt
        )
        handleUpdateItem(itemIndex, { options })
      }
    },
    [items, handleUpdateItem]
  )

  const handleDeleteOption = useCallback(
    (itemIndex: number, optionIndex: number) => {
      const item = items[itemIndex]
      if (item.type === FIELD_TYPES.SELECT && item.options) {
        const options = item.options.filter((_, i) => i !== optionIndex)
        handleUpdateItem(itemIndex, { options })
      }
    },
    [items, handleUpdateItem]
  )

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`item-${index}-type`}>Field Type</Label>
                  <Select
                    value={item.type}
                    onValueChange={(value: FieldType) =>
                      handleUpdateItem(index, { type: value })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger id={`item-${index}-type`}>
                      <SelectValue placeholder="Select field type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FIELD_TYPES.TEXT}>Text</SelectItem>
                      <SelectItem value={FIELD_TYPES.TEXTAREA}>
                        Text Area
                      </SelectItem>
                      <SelectItem value={FIELD_TYPES.NUMBER}>Number</SelectItem>
                      <SelectItem value={FIELD_TYPES.CHECKBOX}>
                        Checkbox
                      </SelectItem>
                      <SelectItem value={FIELD_TYPES.SELECT}>Select</SelectItem>
                      <SelectItem value={FIELD_TYPES.DATE}>Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`item-${index}-label`}>Field Label</Label>
                  <Input
                    id={`item-${index}-label`}
                    value={item.label}
                    onChange={(e) =>
                      handleUpdateItem(index, { label: e.target.value })
                    }
                    placeholder="Enter field label"
                    disabled={disabled}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={`item-${index}-required`}
                  checked={item.required}
                  onCheckedChange={(checked) =>
                    handleUpdateItem(index, { required: checked })
                  }
                  disabled={disabled}
                />
                <Label htmlFor={`item-${index}-required`}>Required</Label>
              </div>

              {item.type === FIELD_TYPES.SELECT && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  {item.options?.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="flex items-center space-x-2"
                    >
                      <Input
                        value={option}
                        onChange={(e) =>
                          handleUpdateOption(index, optionIndex, e.target.value)
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                        disabled={disabled}
                        required
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteOption(index, optionIndex)}
                        disabled={disabled || item.options?.length === 1}
                        aria-label={`Delete option ${optionIndex + 1}`}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddOption(index)}
                    disabled={disabled}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteItem(index)}
              disabled={disabled}
              aria-label={`Delete ${item.label || "field"}`}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
      <Button
        onClick={handleAddItem}
        disabled={disabled}
        aria-label="Add new field"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Field
      </Button>
    </div>
  )
} 