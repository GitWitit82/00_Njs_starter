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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const templates = await db.formTemplate.findMany({
      include: {
        department: true,
        phase: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("[FORM_TEMPLATES_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const template = await db.formTemplate.create({
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
        order: body.order ?? 0,
        isActive: body.isActive ?? true,
      },
      include: {
        department: true,
        phase: true,
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("[FORM_TEMPLATES_POST]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors[0].message }), {
        status: 400,
      })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 