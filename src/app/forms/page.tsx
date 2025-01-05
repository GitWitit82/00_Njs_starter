"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FormType } from "@prisma/client"
import { toast } from "sonner"

interface FormTemplate {
  id: string
  name: string
  description?: string
  type: FormType
  createdAt: string
  updatedAt: string
}

export default function FormsPage() {
  const [templates, setTemplates] = useState<FormTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/forms/templates")
        if (!response.ok) {
          throw new Error("Failed to fetch templates")
        }
        const data = await response.json()
        setTemplates(data)
      } catch (error) {
        toast.error("Failed to load form templates")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Form Templates</h1>
        <Link href="/forms/builder">
          <Button>Create Template</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No form templates found.</p>
          <p className="mt-2">
            <Link href="/forms/builder" className="text-primary hover:underline">
              Create your first template
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/forms/templates/${template.id}`}
              className="block"
            >
              <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                <h2 className="font-semibold mb-2">{template.name}</h2>
                {template.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {template.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{template.type}</span>
                  <span>
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 