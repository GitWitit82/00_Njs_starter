import { z } from "zod"

const formItemLayoutSchema = z.object({
  width: z.enum(["full", "half", "third"]),
  row: z.number()
})

/**
 * Form item schema for both form fields and checklist items
 */
export const formItemSchema = z.object({
  id: z.string(),
  content: z.string(),
  type: z.enum(["TEXT", "TEXTAREA", "SELECT", "CHECKBOX", "RADIO", "CHECKLIST"]),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  size: z.enum(["small", "normal", "large"]).optional(),
  layout: formItemLayoutSchema
})

/**
 * Form section schema
 */
export const formSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  items: z.array(formItemSchema)
})

export const formSchemaSchema = z.object({
  sections: z.array(formSectionSchema),
})

/**
 * Form template schema
 */
export const formTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  workflowId: z.string().optional(),
  phaseId: z.string().optional(),
  sections: z.array(formSectionSchema),
  isActive: z.boolean(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type FormItem = z.infer<typeof formItemSchema>
export type FormSection = z.infer<typeof formSectionSchema>
export type FormSchema = z.infer<typeof formSchemaSchema>
export type FormTemplate = z.infer<typeof formTemplateSchema>
export type FormItemLayout = z.infer<typeof formItemLayoutSchema> 