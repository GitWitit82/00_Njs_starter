import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"
import { z } from "zod"

const formTemplateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum(["FORM", "CHECKLIST"]),
  schema: z.object({
    fields: z.array(
      z.object({
        id: z.string(),
        type: z.string(),
        label: z.string(),
        placeholder: z.string().optional(),
        required: z.boolean().optional(),
      })
    ),
  }),
})

/**
 * POST /api/forms/templates
 * Create a new form template
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || !["ADMIN", "MANAGER"].includes(user.role)) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const body = await req.json()
    const validatedData = formTemplateSchema.parse(body)

    const template = await db.formTemplate.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        schema: validatedData.schema,
        phaseId: "", // This will be set when the template is assigned to a phase
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("[FORM_TEMPLATE_CREATE]", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/forms/templates
 * Get all form templates
 */
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const templates = await db.formTemplate.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("[FORM_TEMPLATES_GET]", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
} 