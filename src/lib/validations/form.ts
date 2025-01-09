import { z } from "zod"

/**
 * Form item schema for both form fields and checklist items
 */
export const formItemSchema = z.object({
  id: z.string(),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["TEXT", "TEXTAREA", "SELECT", "CHECKBOX", "RADIO"]),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
})

/**
 * Form section schema
 */
export const formSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  type: z.enum(["FORM", "CHECKLIST"]),
  description: z.string().optional(),
  items: z.array(formItemSchema),
})

export const formSchemaSchema = z.object({
  sections: z.array(formSectionSchema),
})

/**
 * Form template schema
 */
export const formTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  workflowId: z.string().optional(),
  phaseId: z.string().optional(),
  schema: formSchemaSchema,
  isActive: z.boolean().optional(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type FormItem = z.infer<typeof formItemSchema>
export type FormSection = z.infer<typeof formSectionSchema>
export type FormSchema = z.infer<typeof formSchemaSchema>
export type FormTemplate = z.infer<typeof formTemplateSchema> 