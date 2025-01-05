import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"

const formTemplateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum(["CHECKLIST", "FORM", "CUSTOM"]),
  departmentId: z.string().optional(),
  phaseId: z.string(),
  schema: z.any(),
  layout: z.any().optional(),
  style: z.any().optional(),
  metadata: z.any().optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const template = await db.formTemplate.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        phase: true,
      },
    })

    if (!template) {
      return new NextResponse("Template not found", { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("[FORM_TEMPLATE_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const json = await request.json()
    const body = formTemplateSchema.parse(json)

    // Check if template exists
    const template = await db.formTemplate.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return new NextResponse("Template not found", { status: 404 })
    }

    // Check if phase exists
    const phase = await db.phase.findUnique({
      where: { id: body.phaseId },
    })

    if (!phase) {
      return new NextResponse("Phase not found", { status: 404 })
    }

    // Check if department exists if provided
    if (body.departmentId) {
      const department = await db.department.findUnique({
        where: { id: body.departmentId },
      })

      if (!department) {
        return new NextResponse("Department not found", { status: 404 })
      }
    }

    const updatedTemplate = await db.formTemplate.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        departmentId: body.departmentId,
        phaseId: body.phaseId,
        schema: body.schema,
        layout: body.layout,
        style: body.style,
        metadata: body.metadata,
        order: body.order ?? template.order,
        isActive: body.isActive ?? template.isActive,
      },
      include: {
        department: true,
        phase: true,
      },
    })

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error("[FORM_TEMPLATE_PUT]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors[0].message }), {
        status: 400,
      })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Check if template exists
    const template = await db.formTemplate.findUnique({
      where: { id: params.id },
      include: {
        responses: true,
      },
    })

    if (!template) {
      return new NextResponse("Template not found", { status: 404 })
    }

    // Check if template has any responses
    if (template.responses.length > 0) {
      return new NextResponse(
        JSON.stringify({
          error: "Cannot delete template with existing responses",
        }),
        { status: 400 }
      )
    }

    await db.formTemplate.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[FORM_TEMPLATE_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 