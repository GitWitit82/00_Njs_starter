import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

// Validation schema for form template
const formTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  workflowId: z.string().min(1, "Workflow is required"),
  phaseId: z.string().min(1, "Phase is required"),
  type: z.enum(["FORM", "CHECKLIST", "SURVEY", "INSPECTION"]),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum(["FORM", "CHECKLIST", "SURVEY", "INSPECTION"]),
    items: z.array(z.object({
      id: z.string(),
      content: z.string(),
      type: z.string().optional(),
      required: z.boolean().optional(),
      options: z.array(z.string()).optional()
    }))
  }))
})

// Safe console.error that doesn't throw on null
const safeConsoleError = (message: string, error: unknown) => {
  console.error(message, error instanceof Error ? error.message : String(error))
}

// Helper function to create error responses
const createErrorResponse = (error: string, status: number, details?: unknown) => {
  const errorResponse = {
    success: false,
    error,
    ...(details && { details: details instanceof Error ? details.message : details })
  }

  return new Response(
    JSON.stringify(errorResponse),
    { 
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

// Helper function to create success responses
const createSuccessResponse = (data: unknown) => {
  return new Response(
    JSON.stringify({
      success: true,
      data
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return createErrorResponse("Unauthorized", 401)
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return createErrorResponse("User not found", 404)
    }

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      safeConsoleError("Failed to parse request body:", error)
      return createErrorResponse("Invalid request body", 400, "Failed to parse JSON body")
    }

    // Validate the body against schema
    let validatedData
    try {
      validatedData = formTemplateSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        safeConsoleError("Validation error:", error)
        return createErrorResponse("Validation error", 400, error.errors)
      }
      throw error
    }

    // Create form template
    const formTemplate = await prisma.formTemplate.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        departmentId: validatedData.departmentId,
        workflowId: validatedData.workflowId,
        phaseId: validatedData.phaseId,
        type: validatedData.type,
        isActive: true,
        order: 0,
        schema: {
          sections: validatedData.sections.map(section => ({
            id: section.id,
            title: section.title,
            type: section.type,
            fields: section.items.map(item => ({
              id: item.id,
              label: item.content,
              type: item.type || (section.type === "CHECKLIST" ? "checkbox" : "text"),
              required: item.required || false,
              options: item.options || []
            }))
          }))
        },
        layout: {
          sections: validatedData.sections.map(section => ({
            id: section.id,
            title: section.title,
            type: section.type,
            fields: section.items.map(item => ({
              id: item.id,
              label: item.content,
              type: item.type || (section.type === "CHECKLIST" ? "checkbox" : "text")
            }))
          }))
        },
        style: {
          theme: "default"
        },
        metadata: {
          version: 1,
          lastUpdated: new Date().toISOString()
        },
        currentVersion: 1
      },
      include: {
        department: {
          select: {
            name: true,
            color: true,
          },
        },
      },
    })

    // Return success response with redirect
    return new Response(
      JSON.stringify({
        success: true,
        data: formTemplate,
        redirect: "/forms"
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Location': '/forms'
        }
      }
    )
  } catch (error) {
    safeConsoleError("Failed to create form template:", error)
    
    // Check for specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint failed')) {
        return createErrorResponse(
          "Invalid reference",
          400,
          "One or more referenced IDs (department, workflow, phase) do not exist"
        )
      }
    }

    return createErrorResponse(
      "Internal server error",
      500,
      error instanceof Error ? error.message : "Unknown error occurred"
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return createErrorResponse("Unauthorized", 401)
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get("departmentId")
    const phaseId = searchParams.get("phaseId")

    const templates = await prisma.formTemplate.findMany({
      where: {
        ...(departmentId ? { departmentId } : {}),
        ...(phaseId ? { phaseId } : {}),
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        phase: {
          select: {
            id: true,
            name: true,
            workflow: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return createSuccessResponse(templates)
  } catch (error) {
    safeConsoleError("Failed to fetch form templates:", error)
    return createErrorResponse(
      "Internal server error",
      500,
      error instanceof Error ? error.message : "Unknown error occurred"
    )
  }
} 