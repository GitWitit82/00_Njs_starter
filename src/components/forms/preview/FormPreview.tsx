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
  departments: Department[]
}

/**
 * Form preview component
 * Displays a read-only version of the form template
 */
export function FormPreview({ template, departments }: FormPreviewProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div 
        className="p-6 rounded-lg"
        style={{ backgroundColor: template.department?.color || "#e5e7eb" }}
      >
        <h2 className="text-2xl font-bold text-black">{template.name}</h2>
        {template.description && (
          <p className="mt-2 text-black/80">{template.description}</p>
        )}
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
                  {item.type === 'CHECKLIST' && item.options && (
                    <div className="border border-black">
                      <div className="bg-black text-white p-2 text-center font-bold">
                        TASKS
                      </div>
                      {item.options.map((task: string, taskIndex: number) => (
                        <div key={taskIndex} className="flex border-b border-black last:border-b-0">
                          <div className="w-12 p-2 border-r border-black text-center font-bold">
                            {taskIndex + 1}
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
                  {item.type !== 'CHECKLIST' && (
                    <>
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
                    </>
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