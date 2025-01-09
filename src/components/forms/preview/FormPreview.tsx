"use client"

import { useRouter } from "next/navigation"
import { Department, FormTemplate, Workflow } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

interface FormPreviewProps {
  template: FormTemplate & {
    department: Department | null
    workflow: Workflow | null
  }
}

/**
 * Form preview component
 * Displays a read-only version of the form template
 */
export function FormPreview({ template }: FormPreviewProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {template.department && (
              <Badge variant="outline" className="border-2" style={{ borderColor: template.department.color }}>
                {template.department.name}
              </Badge>
            )}
            <Badge variant="secondary">
              {template.type}
            </Badge>
          </div>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => router.push(`/forms/templates/${template.id}`)}
        >
          Edit Template
        </Button>
      </div>

      <Card className="p-6">
        {template.schema.sections?.map((section: any, index: number) => (
          <div key={section.id || index} className="mb-8 last:mb-0">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              {section.description && (
                <p className="text-muted-foreground mt-1">{section.description}</p>
              )}
            </div>
            <div className="space-y-4">
              {section.items?.map((item: any, itemIndex: number) => (
                <div key={item.id || itemIndex} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <label className="text-sm font-medium">
                      {item.content}
                      {item.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                  </div>
                  {item.type === 'TEXT' && (
                    <div className="h-10 bg-muted rounded-md" />
                  )}
                  {item.type === 'TEXTAREA' && (
                    <div className="h-24 bg-muted rounded-md" />
                  )}
                  {item.type === 'SELECT' && item.options && (
                    <div className="h-10 bg-muted rounded-md" />
                  )}
                  {item.type === 'CHECKBOX' && (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 bg-muted rounded" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
} 