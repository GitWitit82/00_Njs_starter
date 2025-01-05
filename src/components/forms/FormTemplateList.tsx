import { FormTemplate, Department, Phase } from "@prisma/client"
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card"
import { Button } from "../ui/button"
import { PencilIcon, TrashIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface FormTemplateListProps {
  templates: (FormTemplate & {
    department: Department
    phase: Phase
  })[]
  onDelete?: (id: string) => Promise<void>
  className?: string
}

/**
 * FormTemplateList component displays a grid of form templates
 * with options to edit and delete templates
 */
export function FormTemplateList({
  templates,
  onDelete,
  className,
}: FormTemplateListProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {templates.map((template) => (
        <Card key={template.id} className="p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium">{template.name}</h3>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/forms/templates/${template.id}`}>
                <Button variant="ghost" size="icon">
                  <PencilIcon className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </Link>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(template.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: template.department.color }}
            />
            <span className="text-sm">{template.department.name}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Phase: {template.phase.name}</span>
            <span>Type: {template.type}</span>
          </div>

          <div className="text-sm text-muted-foreground">
            Last updated: {new Date(template.updatedAt).toLocaleDateString()}
          </div>
        </Card>
      ))}
    </div>
  )
} 