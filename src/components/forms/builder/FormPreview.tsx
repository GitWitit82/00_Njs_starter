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

interface FormPreviewProps {
  formData: FormTemplate
}

export function FormPreview({ formData }: FormPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Form Header Preview */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold">{formData.name || "Untitled Form"}</h2>
        {formData.description && (
          <p className="mt-2 text-gray-600">{formData.description}</p>
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

            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.id} className="space-y-2">
                  <Label>{item.content}</Label>

                  {item.type === "TEXT" && (
                    <Input disabled placeholder="Text input" />
                  )}

                  {item.type === "TEXTAREA" && (
                    <Textarea 
                      disabled 
                      placeholder="Text area input" 
                      className={
                        item.size === "small" ? "h-20" :
                        item.size === "large" ? "h-48" : "h-32"
                      }
                    />
                  )}

                  {item.type === "CHECKLIST" && (
                    <div>
                      <div className="bg-black text-white p-2 text-center font-bold">
                        TASKS
                      </div>
                      <div className="border border-black">
                        {item.options?.map((option, index) => (
                          <div key={index} className="flex border-b border-black last:border-b-0">
                            <div className="w-12 p-2 border-r border-black text-center font-bold">
                              {index + 1}
                            </div>
                            <div className="w-12 p-2 border-r border-black flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-black rounded-full" />
                            </div>
                            <div className="flex-1 p-2 text-sm">
                              {option}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.type === "RADIO" && (
                    <RadioGroup disabled>
                      {item.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`radio-${item.id}-${index}`} />
                          <Label htmlFor={`radio-${item.id}-${index}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {item.type === "CHECKBOX" && (
                    <div className="space-y-2">
                      {item.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox id={`checkbox-${item.id}-${index}`} disabled />
                          <Label htmlFor={`checkbox-${item.id}-${index}`}>{option}</Label>
                        </div>
                      ))}
                    </div>
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
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 