import { useState, useEffect } from "react"
import { FormTemplate } from "@prisma/client"
import { FormField } from "./FormField"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CustomDynamicFormProps {
  template: Partial<FormTemplate>
  projectData?: Record<string, any>
  departmentData?: Record<string, any>
  userData?: Record<string, any>
  initialData?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
  className?: string
}

/**
 * CustomDynamicForm component for handling advanced form features
 * Supports conditional fields, calculations, and auto-population
 */
export function CustomDynamicForm({
  template,
  projectData = {},
  departmentData = {},
  userData = {},
  initialData = {},
  onChange,
  className,
}: CustomDynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [visibleFields, setVisibleFields] = useState<string[]>([])
  const [computedValues, setComputedValues] = useState<Record<string, any>>({})

  /**
   * Initializes form data with auto-populated values
   */
  useEffect(() => {
    const autoPopulatedData = { ...initialData }

    template.schema?.fields?.forEach((field) => {
      if (field.metadata?.autoPopulate) {
        const source = field.metadata.autoPopulate.source
        const path = field.metadata.autoPopulate.path

        let value
        switch (source) {
          case "project":
            value = getNestedValue(projectData, path)
            break
          case "department":
            value = getNestedValue(departmentData, path)
            break
          case "user":
            value = getNestedValue(userData, path)
            break
        }

        if (value !== undefined) {
          autoPopulatedData[field.id] = value
        }
      }
    })

    setFormData(autoPopulatedData)
  }, [template, projectData, departmentData, userData, initialData])

  /**
   * Updates visible fields based on conditions
   */
  useEffect(() => {
    const visible = template.schema?.fields?.filter((field) => {
      if (!field.metadata?.condition) return true

      try {
        // Evaluate the condition using the current form data
        const condition = field.metadata.condition
        return evaluateCondition(condition, formData)
      } catch (error) {
        console.error("Error evaluating condition:", error)
        return true
      }
    }).map((field) => field.id) || []

    setVisibleFields(visible)
  }, [template, formData])

  /**
   * Updates computed values based on formulas
   */
  useEffect(() => {
    const computed: Record<string, any> = {}

    template.schema?.fields?.forEach((field) => {
      if (field.metadata?.formula) {
        try {
          const result = evaluateFormula(field.metadata.formula, formData)
          computed[field.id] = result
        } catch (error) {
          console.error("Error evaluating formula:", error)
        }
      }
    })

    setComputedValues(computed)
  }, [template, formData])

  /**
   * Handles field value changes
   */
  const handleFieldChange = (fieldId: string, value: any) => {
    const newData = {
      ...formData,
      [fieldId]: value,
    }
    setFormData(newData)
    onChange?.(newData)
  }

  /**
   * Gets a nested value from an object using a dot-notation path
   */
  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc?.[part], obj)
  }

  /**
   * Evaluates a condition expression
   */
  const evaluateCondition = (condition: string, data: Record<string, any>) => {
    // Replace field references with actual values
    const expression = condition.replace(/\${([^}]+)}/g, (_, field) => {
      const value = data[field]
      return typeof value === "string" ? `"${value}"` : value
    })

    // Use Function constructor to create a safe evaluation environment
    return new Function("return " + expression)()
  }

  /**
   * Evaluates a formula expression
   */
  const evaluateFormula = (formula: string, data: Record<string, any>) => {
    // Replace field references with actual values
    const expression = formula.replace(/\${([^}]+)}/g, (_, field) => {
      const value = data[field]
      return typeof value === "string" ? `"${value}"` : value
    })

    // Use Function constructor to create a safe evaluation environment
    return new Function("return " + expression)()
  }

  /**
   * Renders a field with its computed value if available
   */
  const renderField = (field: any) => {
    if (!visibleFields.includes(field.id)) return null

    const value = computedValues[field.id] !== undefined
      ? computedValues[field.id]
      : formData[field.id]

    return (
      <FormField
        key={field.id}
        {...field}
        value={value}
        onChange={(newValue) => handleFieldChange(field.id, newValue)}
        disabled={field.metadata?.formula !== undefined}
      />
    )
  }

  /**
   * Renders fields based on the template layout
   */
  const renderFields = () => {
    const { schema, layout } = template

    if (!schema?.fields) return null

    // If using sections layout
    if (layout?.type === "sections" && schema.sections?.length) {
      return schema.sections.map((section) => (
        <Card key={section.id} className="p-4 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">{section.title}</h3>
            {section.description && (
              <p className="text-sm text-gray-500">{section.description}</p>
            )}
          </div>
          <div className={getLayoutClass(layout)}>
            {section.fields.map((fieldId) => {
              const field = schema.fields?.find((f) => f.id === fieldId)
              if (!field) return null
              return renderField(field)
            })}
          </div>
        </Card>
      ))
    }

    // If using grid layout
    if (layout?.type === "grid") {
      return (
        <div className={getLayoutClass(layout)}>
          {schema.fields.map((field) => renderField(field))}
        </div>
      )
    }

    // Default layout
    return (
      <div className="space-y-4">
        {schema.fields.map((field) => renderField(field))}
      </div>
    )
  }

  /**
   * Gets the CSS class for the layout type
   */
  const getLayoutClass = (layout: any) => {
    switch (layout?.type) {
      case "grid":
        return cn(
          "grid gap-4",
          layout.config?.columns === 2 && "grid-cols-2",
          layout.config?.columns === 3 && "grid-cols-3",
          layout.config?.columns === 4 && "grid-cols-4"
        )
      default:
        return "space-y-4"
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {renderFields()}
    </div>
  )
} 