import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Schema for form field validation
const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum([
    "TEXT",
    "TEXTAREA",
    "NUMBER",
    "CHECKBOX",
    "RADIO",
    "SELECT",
    "DATE",
    "TIME",
    "DATETIME",
    "CUSTOM",
  ]),
  label: z.string(),
  required: z.boolean().default(false),
  defaultValue: z.any().optional(),
  options: z.array(z.any()).optional(),
  validation: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

// Schema for form template creation
const formTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["CHECKLIST", "FORM", "CUSTOM"]),
  departmentId: z.string().optional(),
  phaseId: z.string(),
  schema: z.object({
    fields: z.array(formFieldSchema),
    sections: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      fields: z.array(z.string()), // Field IDs
    })).optional(),
    layout: z.record(z.any()).optional(),
  }),
  layout: z.record(z.any()).optional(),
  style: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

/**
 * GET /api/forms/templates
 * Get all form templates with optional filtering
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const departmentId = searchParams.get("departmentId")
    const phaseId = searchParams.get("phaseId")
    const search = searchParams.get("search")
    const activeOnly = searchParams.get("activeOnly") === "true"

    const where = {
      ...(type && { type }),
      ...(departmentId && { departmentId }),
      ...(phaseId && { phaseId }),
      ...(activeOnly && { isActive: true }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    }

    const templates = await prisma.formTemplate.findMany({
      where,
      include: {
        department: true,
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
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
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
export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const json = await request.json()
    const body = formTemplateSchema.parse(json)

    // Validate phase exists
    const phase = await prisma.phase.findUnique({
      where: { id: body.phaseId },
    })

    if (!phase) {
      return new NextResponse("Phase not found", { status: 404 })
    }

    // If department is specified, validate it exists
    if (body.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: body.departmentId },
      })

      if (!department) {
        return new NextResponse("Department not found", { status: 404 })
      }
    }

    // Create the template
    const template = await prisma.formTemplate.create({
      data: {
        ...body,
        schema: body.schema,
        layout: body.layout || {},
        style: body.style || {},
        metadata: body.metadata || {},
      },
      include: {
        department: true,
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
    })

    return NextResponse.json(template)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    console.error("[FORM_TEMPLATES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 