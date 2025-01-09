"use client"

import { FormTemplate } from "@/lib/validations/form"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface FormPreviewProps {
  formData: FormTemplate
  departments?: {
    id: string
    name: string
    color: string
  }[]
}

export function FormPreview({ formData, departments = [] }: FormPreviewProps) {
  const departmentColor = formData.departmentId 
    ? departments.find(d => d.id === formData.departmentId)?.color || '#e5e7eb'
    : '#e5e7eb'

  return (
    <div className="space-y-6">
      {/* Form Header Preview */}
      <div 
        className="p-6 rounded-lg"
        style={{ backgroundColor: departmentColor }}
      >
        <h2 className="text-2xl font-bold text-black">{formData.name || "Untitled Form"}</h2>
        {formData.description && (
          <p className="mt-2 text-black/80">{formData.description}</p>
        )}
      </div>

      {/* Sections Preview */}
      <div className="space-y-6">
        {formData.sections.map((section) => (
          <Card key={section.id} className="p-6">
            <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
            {section.description && (
              <p className="text-gray-600 mb-4">{section.description}</p>
            )}

            <div className="grid gap-4">
              {section.items.map((item) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "space-y-2",
                    item.layout.width === "half" && "col-span-6",
                    item.layout.width === "third" && "col-span-4",
                    item.layout.width === "full" && "col-span-12"
                  )}
                >
                  <Label>{item.content}</Label>

                  {item.type === "TEXT" && (
                    <Input disabled placeholder="Text input" />
                  )}

                  {item.type === "TEXTAREA" && (
                    <Textarea 
                      disabled 
                      placeholder="Text area input" 
                      className={cn(
                        item.size === "small" && "h-20",
                        item.size === "normal" && "h-32",
                        item.size === "large" && "h-48"
                      )}
                    />
                  )}

                  {item.type === "SELECT" && (
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
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

                  {item.type === "CHECKBOX" && item.options && (
                    <div className="space-y-2">
                      {item.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox id={`${item.id}-${index}`} disabled />
                          <label
                            htmlFor={`${item.id}-${index}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.type === "RADIO" && item.options && (
                    <RadioGroup disabled>
                      {item.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${item.id}-${index}`} />
                          <label
                            htmlFor={`${item.id}-${index}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {item.type === "CHECKLIST" && item.options && (
                    <div className="border border-black">
                      <div className="bg-black text-white p-2 text-center font-bold">
                        TASKS
                      </div>
                      {item.options.map((task, index) => (
                        <div key={index} className="flex border-b border-black last:border-b-0">
                          <div className="w-12 p-2 border-r border-black text-center font-bold">
                            {index + 1}
                          </div>
                          <div className="w-12 p-2 border-r border-black flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-black rounded-full" />
                          </div>
                          <div className="flex-1 p-2 text-sm">
                            {task}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 