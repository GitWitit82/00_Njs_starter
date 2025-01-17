"use client"

import { FormSection, FormMetadata } from "@/types/form"
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
import { DatePicker } from "@/components/ui/date-picker"

interface FormPreviewProps {
  sections: FormSection[]
  metadata: FormMetadata
}

/**
 * FormPreview component for previewing form templates
 * @param {FormPreviewProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function FormPreview({ sections, metadata }: FormPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{metadata.title}</h2>
        {metadata.description && (
          <p className="text-muted-foreground">{metadata.description}</p>
        )}
      </div>

      {sections.map((section) => (
        <Card key={section.id} className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              {section.description && (
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.id} className="space-y-2">
                  <Label
                    htmlFor={item.id}
                    className="flex items-center space-x-1"
                  >
                    <span>{item.label}</span>
                    {item.required && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>

                  {item.type === "text" && (
                    <Input
                      id={item.id}
                      placeholder={`Enter ${item.label.toLowerCase()}`}
                      required={item.required}
                      disabled
                    />
                  )}

                  {item.type === "textarea" && (
                    <Textarea
                      id={item.id}
                      placeholder={`Enter ${item.label.toLowerCase()}`}
                      required={item.required}
                      disabled
                    />
                  )}

                  {item.type === "number" && (
                    <Input
                      id={item.id}
                      type="number"
                      placeholder={`Enter ${item.label.toLowerCase()}`}
                      required={item.required}
                      disabled
                    />
                  )}

                  {item.type === "checkbox" && (
                    <div className="flex items-center space-x-2">
                      <Switch id={item.id} disabled />
                      <Label htmlFor={item.id}>{item.label}</Label>
                    </div>
                  )}

                  {item.type === "select" && (
                    <Select disabled>
                      <SelectTrigger id={item.id}>
                        <SelectValue
                          placeholder={`Select ${item.label.toLowerCase()}`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {item.options?.map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {item.type === "date" && (
                    <DatePicker
                      id={item.id}
                      date={null}
                      onSelect={() => {}}
                      disabled
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 