import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { formTemplateSchema } from "@/lib/validations/form"

/**
 * GET /api/forms/templates
 * Get all form templates
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
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
        versions: {
          orderBy: {
            version: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("[FORM_TEMPLATES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * POST /api/forms/templates
 * Create a new form template
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ 
          success: false,
          error: "Unauthorized"
        }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ 
          success: false,
          error: "Invalid JSON",
          details: "Failed to parse request body"
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse(
        JSON.stringify({ 
          success: false,
          error: "User not found"
        }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Prepare and validate the data
    try {
      // Ensure schema sections are properly structured
      const preparedData = {
        ...body,
        schema: {
          sections: Array.isArray(body.schema?.sections) 
            ? body.schema.sections.map((section: any) => ({
                id: section.id || crypto.randomUUID(),
                title: section.title || "Untitled Section",
                description: section.description || "",
                fields: Array.isArray(section.fields)
                  ? section.fields.map((field: any) => ({
                      id: field.id || crypto.randomUUID(),
                      label: field.label || "Untitled Field",
                      type: field.type || "text",
                      required: Boolean(field.required),
                      options: Array.isArray(field.options) ? field.options : []
                    }))
                  : []
              }))
            : []
        },
        layout: body.layout || {},
        style: body.style || {},
        metadata: body.metadata || {},
        order: typeof body.order === 'number' ? body.order : 0,
        isActive: true
      }

      // Validate the prepared data
      const validatedData = formTemplateSchema.parse(preparedData)

      // Create the template and its initial version
      const template = await prisma.$transaction(async (tx) => {
        // Create the template
        const newTemplate = await tx.formTemplate.create({
          data: {
            name: validatedData.name,
            description: validatedData.description || "",
            type: validatedData.type,
            departmentId: validatedData.departmentId,
            workflowId: validatedData.workflowId,
            phaseId: validatedData.phaseId,
            schema: validatedData.schema,
            layout: validatedData.layout,
            style: validatedData.style,
            metadata: validatedData.metadata,
            order: validatedData.order,
            isActive: true,
            currentVersion: 1
          },
        })

        // Create the initial version
        await tx.formVersion.create({
          data: {
            version: 1,
            templateId: newTemplate.id,
            schema: validatedData.schema,
            layout: validatedData.layout,
            style: validatedData.style,
            metadata: validatedData.metadata,
            createdById: user.id,
            changelog: "Initial version",
            isActive: true,
          },
        })

        // Return the complete template
        return await tx.formTemplate.findUniqueOrThrow({
          where: { id: newTemplate.id },
          include: {
            department: true,
            phase: true,
            workflow: true,
            versions: {
              orderBy: { version: 'desc' },
              take: 1,
            },
          },
        })
      })

      return new NextResponse(
        JSON.stringify({ 
          success: true,
          data: template
        }), 
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (error: any) {
      // Log the full error for debugging
      console.error('Form template creation error:', {
        error: error.message,
        name: error.name,
        stack: error.stack,
        data: body
      })

      // Handle validation errors
      if (error.name === 'ZodError') {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: "Validation error",
            details: error.errors
          }),
          { status: 422, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Handle database errors
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Database error",
          details: error.message || "Failed to save form template"
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (error: any) {
    // Log the full error for debugging
    console.error('Unexpected server error:', {
      error: error.message,
      name: error.name,
      stack: error.stack
    })

    // Handle unexpected errors
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Server error",
        details: error.message || "An unexpected error occurred"
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 