import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const templateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  phaseId: z.string().optional(),
  metadata: z.unknown().optional()
})

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const id = paths[paths.indexOf("templates") + 1]

    const template = await prisma.formTemplate.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: {
            createdAt: "desc"
          }
        },
        completionRequirements: {
          include: {
            dependsOn: true
          }
        },
        project: true,
        task: true,
        phase: true
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: "Form template not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("[FORM_TEMPLATE_GET]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const id = paths[paths.indexOf("templates") + 1]
    const data = templateSchema.parse(await request.json())

    const template = await prisma.formTemplate.update({
      where: { id },
      data,
      include: {
        versions: {
          orderBy: {
            createdAt: "desc"
          }
        },
        completionRequirements: {
          include: {
            dependsOn: true
          }
        },
        project: true,
        task: true,
        phase: true
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("[FORM_TEMPLATE_PATCH]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const id = paths[paths.indexOf("templates") + 1]

    await prisma.formTemplate.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Template deleted successfully" })
  } catch (error) {
    console.error("[FORM_TEMPLATE_DELETE]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 