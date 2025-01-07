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
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    
    // Validate the request body
    const validatedData = formTemplateSchema.parse(json)

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Create the template and its initial version
    const template = await prisma.$transaction(async (tx) => {
      // Create the template
      const template = await tx.formTemplate.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          type: validatedData.type,
          departmentId: validatedData.departmentId,
          phaseId: validatedData.phaseId,
          schema: validatedData.schema,
          layout: validatedData.layout || {},
          style: validatedData.style || {},
          metadata: validatedData.metadata || {},
          priority: validatedData.priority,
          order: validatedData.order,
          isActive: validatedData.isActive,
          currentVersion: 1,
        },
      })

      // Create the initial version
      await tx.formVersion.create({
        data: {
          version: 1,
          templateId: template.id,
          schema: validatedData.schema,
          layout: validatedData.layout || {},
          style: validatedData.style || {},
          metadata: validatedData.metadata || {},
          createdById: user.id,
          changelog: "Initial version",
          isActive: true,
        },
      })

      return template
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("[FORM_TEMPLATE_POST]", error)
    if (error.name === "ZodError") {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
} 