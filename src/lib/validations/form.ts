import { z } from "zod"

/**
 * Schema for form field validation
 */
const formFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string(),
  required: z.boolean().default(false),
  options: z.array(z.any()).optional(),
})

/**
 * Schema for form section validation
 */
const formSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  fields: z.array(formFieldSchema).default([]),
})

/**
 * Schema for form schema validation
 */
const formSchemaStructure = z.object({
  sections: z.array(formSectionSchema).default([]),
})

/**
 * Schema for form template validation
 */
export const formTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  type: z.enum(["FORM", "CHECKLIST", "SURVEY", "INSPECTION"]),
  departmentId: z.string().min(1, "Department is required"),
  workflowId: z.string().min(1, "Workflow is required"),
  phaseId: z.string().min(1, "Phase is required"),
  schema: formSchemaStructure,
  layout: z.record(z.any()).default({}),
  style: z.record(z.any()).default({}),
  metadata: z.record(z.any()).default({}),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
})

export type FormTemplate = z.infer<typeof formTemplateSchema>

/**
 * Schema for form version validation
 */
export const formVersionSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  version: z.number().int().min(1, "Version must be at least 1"),
  schema: formSchemaStructure,
  layout: z.record(z.any()).optional(),
  style: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  changelog: z.string().min(1, "Changelog is required"),
  isActive: z.boolean().optional(),
})

/**
 * Schema for form instance validation
 */
export const formInstanceSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  versionId: z.string().min(1, "Version ID is required"),
  projectId: z.string().min(1, "Project ID is required"),
  projectTaskId: z.string().min(1, "Project Task ID is required"),
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED"]).optional(),
})

/**
 * Schema for form response validation
 */
export const formResponseSchema = z.object({
  instanceId: z.string().min(1, "Instance ID is required"),
  data: z.record(z.any()),
  metadata: z.record(z.any()).optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]).optional(),
  comments: z.string().optional(),
}) 