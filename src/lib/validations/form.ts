import { z } from "zod"

/**
 * Schema for form field validation
 */
export const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum([
    "TEXT",
    "TEXTAREA",
    "NUMBER",
    "EMAIL",
    "PASSWORD",
    "DATE",
    "TIME",
    "DATETIME",
    "CHECKBOX",
    "RADIO",
    "SELECT",
    "MULTISELECT",
    "FILE",
    "IMAGE",
    "SIGNATURE",
    "CUSTOM",
  ]),
  label: z.string().min(1, "Label is required"),
  name: z.string().min(1, "Name is required"),
  placeholder: z.string().optional(),
  defaultValue: z.any().optional(),
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),
  validation: z.object({
    required: z.boolean().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    customValidation: z.string().optional(),
  }).optional(),
  style: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

/**
 * Schema for form section validation
 */
export const formSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  fields: z.array(formFieldSchema),
  style: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

/**
 * Schema for form template validation
 */
export const formTemplateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum(["FORM", "CHECKLIST", "SURVEY", "INSPECTION"]),
  departmentId: z.string().min(1, "Department is required"),
  phaseId: z.string().min(1, "Phase is required"),
  schema: z.object({
    sections: z.array(formSectionSchema),
  }),
  layout: z.record(z.any()).optional(),
  style: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

/**
 * Schema for form version validation
 */
export const formVersionSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  version: z.number().int().min(1, "Version must be at least 1"),
  schema: z.object({
    sections: z.array(formSectionSchema),
  }),
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