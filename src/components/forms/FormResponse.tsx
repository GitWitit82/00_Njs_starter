'use client'

import { useState } from 'react'
import { FormInstance } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type {
  FormSchema,
  FormField,
  FormSection,
  FormResponseData,
  FormResponseWithRelations
} from '@/types/forms'

interface FormResponseProps {
  instance: FormInstance & {
    template: {
      schema: FormSchema
    }
  }
  response?: FormResponseWithRelations
  onSave: (data: FormResponseData) => Promise<void>
  isReadOnly?: boolean
}

export function FormResponse({
  instance,
  response,
  onSave,
  isReadOnly = false
}: FormResponseProps) {
  const [formData, setFormData] = useState<FormResponseData>(
    response?.data || {}
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      await onSave(formData)
    } finally {
      setIsSaving(false)
    }
  }

  const handleFieldChange = (id: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id]

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={value as string || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            disabled={isReadOnly || isSaving}
            required={field.required}
          />
        )
      case 'select':
        return (
          <Select
            value={value as string || ''}
            onValueChange={(v) => handleFieldChange(field.id, v)}
            disabled={isReadOnly || isSaving}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'checkbox':
        return (
          <Checkbox
            id={field.id}
            checked={value as boolean || false}
            onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            disabled={isReadOnly || isSaving}
          />
        )
      case 'radio':
        return (
          <RadioGroup
            value={value as string || ''}
            onValueChange={(v) => handleFieldChange(field.id, v)}
            disabled={isReadOnly || isSaving}
          >
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      default:
        return (
          <Input
            id={field.id}
            value={value as string || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            disabled={isReadOnly || isSaving}
            required={field.required}
          />
        )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(instance.template.schema.sections as FormSection[]).map((section) => (
        <Card key={section.id} className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">{section.title}</h3>
            {section.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {section.description}
              </p>
            )}
          </div>
          <div className="space-y-4">
            {section.items.map((item) => (
              <div key={item.id} className="space-y-2">
                <Label htmlFor={item.id}>
                  {item.label}
                  {item.required && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </Label>
                {renderField(item)}
              </div>
            ))}
          </div>
        </Card>
      ))}
      {!isReadOnly && (
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      )}
    </form>
  )
} 