import { FormInstance } from '@prisma/client'

/**
 * Checks if a form instance is complete based on its responses
 * @param instance The form instance to check
 * @returns boolean indicating if the form is complete
 */
export function checkFormCompletion(instance: FormInstance): boolean {
  if (!instance.responses || instance.responses.length === 0) {
    return false
  }

  const latestResponse = instance.responses[0]
  if (!latestResponse.data) {
    return false
  }

  // Check if all required fields have values
  const schema = instance.template.schema
  if (!schema || !schema.sections) {
    return false
  }

  for (const section of schema.sections) {
    for (const item of section.items) {
      if (item.required && !latestResponse.data[item.id]) {
        return false
      }
    }
  }

  return true
}

/**
 * Gets the appropriate variant for a status badge
 * @param status The form status
 * @returns The variant string for the badge component
 */
export function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'COMPLETED':
      return 'default'
    case 'REJECTED':
      return 'destructive'
    default:
      return 'secondary'
  }
} 