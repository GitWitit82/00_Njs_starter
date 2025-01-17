import { z } from "zod"
import { FormType, FormPriority } from "@prisma/client"

export const formFieldLayoutSchema = z.object({
  width: z.number().min(1).max(12).optional(),
  rows: z.number().min(1).optional(),
})

export const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum([
    "TEXT",
    "TEXTAREA",
    "SELECT",
    "MULTISELECT",
    "RADIO",
    "CHECKBOX",
    "NUMBER",
    "DATE",
  ]),
  label: z.string().min(1),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  content: z.string().optional(),
  layout: formFieldLayoutSchema.optional(),
})

export const formSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  items: z.array(formFieldSchema),
})

export const formTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.nativeEnum(FormType),
  priority: z.nativeEnum(FormPriority),
  description: z.string().optional().nullable(),
  schema: z.record(z.any()),
  layout: z.record(z.any()).optional().nullable(),
  style: z.record(z.any()).optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
  order: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
  departmentId: z.string().optional().nullable(),
  workflowId: z.string(),
  phaseId: z.string(),
  currentVersion: z.number().optional().default(1),
  validationRules: z.record(z.any()).optional().nullable(),
  defaultValues: z.record(z.any()).optional().nullable(),
})

export type FormFieldLayout = z.infer<typeof formFieldLayoutSchema>
export type FormField = z.infer<typeof formFieldSchema>
export type FormSection = z.infer<typeof formSectionSchema>
export type FormTemplate = z.infer<typeof formTemplateSchema>
export type FormSchemaInput = Omit<FormTemplate, "id"> 