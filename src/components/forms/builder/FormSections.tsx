"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PlusCircle, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FormItem, FormSection } from "@/lib/validations/form"

type FieldType = "TEXT" | "TEXTAREA" | "SELECT" | "CHECKBOX" | "RADIO" | "CHECKLIST";
type TextAreaSize = "small" | "normal" | "large";

interface FormSectionsProps {
  sections: FormSection[]
  errors: { [key: string]: string[] }
  loadingSections: { [key: string]: boolean }
  onSectionChange: (sectionId: string, field: "title" | "description", value: string) => void
  onDeleteSection: (sectionId: string) => void
  onAddItem: (sectionId: string) => void
  onItemChange: (sectionId: string, itemId: string, field: "content" | "type" | "required" | "options" | "size" | "layout", value: any) => void
  onDeleteItem: (sectionId: string, itemId: string) => void
  onItemTypeChange: (sectionId: string, itemId: string, type: FieldType) => void
  onItemWidthChange: (sectionId: string, itemId: string, width: "full" | "half" | "third") => void
  onAddOption: (sectionId: string, itemId: string) => void
  onUpdateOption: (sectionId: string, itemId: string, optionIndex: number, value: string) => void
  onDeleteOption: (sectionId: string, itemId: string, optionIndex: number) => void
  onTextAreaSizeChange: (sectionId: string, itemId: string, size: TextAreaSize) => void
  clearError: (path: string) => void
}

export function FormSections({
  sections,
  errors,
  loadingSections,
  onSectionChange,
  onDeleteSection,
  onAddItem,
  onItemChange,
  onDeleteItem,
  onItemTypeChange,
  onItemWidthChange,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  onTextAreaSizeChange,
  clearError
}: FormSectionsProps) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <Accordion
          key={section.id}
          type="single"
          collapsible
          defaultValue={section.id}
          className="border rounded-lg"
        >
          <AccordionItem value={section.id} className="border-none">
            <div className="flex items-center justify-between px-6 py-4">
              <AccordionTrigger className="hover:no-underline">
                <Input
                  className={cn(
                    "text-lg font-semibold bg-transparent border-0 focus-visible:ring-0 p-0 h-auto",
                    errors[`sections.${section.id}.title`] && "border-red-500"
                  )}
                  placeholder="Section Title"
                  value={section.title}
                  onChange={(e) => {
                    onSectionChange(section.id, "title", e.target.value)
                    clearError(`sections.${section.id}.title`)
                  }}
                />
              </AccordionTrigger>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteSection(section.id)}
                className="ml-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <AccordionContent className="border-t">
              <div className="space-y-4 px-6 py-4">
                <div className="space-y-2">
                  <Label>Section Description</Label>
                  <Textarea
                    className={cn(
                      errors[`sections.${section.id}.description`] && "border-red-500"
                    )}
                    placeholder="Section description (optional)"
                    value={section.description || ""}
                    onChange={(e) => {
                      onSectionChange(section.id, "description", e.target.value)
                      clearError(`sections.${section.id}.description`)
                    }}
                  />
                </div>

                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div key={item.id} className="space-y-4 border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <Label>Field Label</Label>
                          <Input
                            className={cn(
                              errors[`sections.${section.id}.items.${item.id}.content`] && "border-red-500"
                            )}
                            placeholder="Field label"
                            value={item.content}
                            onChange={(e) => {
                              onItemChange(section.id, item.id, "content", e.target.value)
                              clearError(`sections.${section.id}.items.${item.id}.content`)
                            }}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteItem(section.id, item.id)}
                          className="ml-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Field Type</Label>
                          <Select
                            value={item.type}
                            onValueChange={(value: FieldType) => onItemTypeChange(section.id, item.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select field type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TEXT">Text Input</SelectItem>
                              <SelectItem value="TEXTAREA">Text Area</SelectItem>
                              <SelectItem value="SELECT">Dropdown</SelectItem>
                              <SelectItem value="CHECKBOX">Checkbox</SelectItem>
                              <SelectItem value="RADIO">Radio Button</SelectItem>
                              <SelectItem value="CHECKLIST">Checklist</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Field Width</Label>
                          <Select
                            value={item.layout.width}
                            onValueChange={(value: "full" | "half" | "third") => 
                              onItemWidthChange(section.id, item.id, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select field width" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">Full Width</SelectItem>
                              <SelectItem value="half">Half Width</SelectItem>
                              <SelectItem value="third">Third Width</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {(item.type === "SELECT" || item.type === "CHECKBOX" || item.type === "RADIO" || item.type === "CHECKLIST") && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>{item.type === "CHECKLIST" ? "Tasks" : "Options"}</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onAddOption(section.id, item.id)}
                            >
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Add {item.type === "CHECKLIST" ? "Task" : "Option"}
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {item.options?.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => 
                                    onUpdateOption(section.id, item.id, index, e.target.value)
                                  }
                                  placeholder={item.type === "CHECKLIST" ? `Task ${index + 1}` : `Option ${index + 1}`}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onDeleteOption(section.id, item.id, index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.type === "TEXTAREA" && (
                        <div className="space-y-2">
                          <Label>Text Area Size</Label>
                          <Select
                            value={item.size || "normal"}
                            onValueChange={(value: TextAreaSize) => 
                              onTextAreaSizeChange(section.id, item.id, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => onAddItem(section.id)}
                  className="w-full"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  )
} 