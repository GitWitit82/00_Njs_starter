import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const versionSchema = z.object({
  name: z.string().min(1, "Version name is required"),
  description: z.string().optional(),
  schema: z.record(z.unknown()).default({}),
  layout: z.record(z.unknown()).default({}),
  style: z.record(z.unknown()).default({}),
  defaultValues: z.record(z.unknown()).default({}),
  metadata: z.record(z.unknown()).optional().default({}),
  isCurrent: z.boolean().default(false)
})

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const templateId = paths[paths.indexOf("templates") + 1]

    const versions = await prisma.formTemplateVersion.findMany({
      where: { templateId },
      orderBy: { createdAt: "desc" },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    })

    return NextResponse.json(versions)
  } catch (error) {
    console.error("[FORM_VERSIONS_GET]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const templateId = paths[paths.indexOf("templates") + 1]
    const data = versionSchema.parse(await request.json())

    const template = await prisma.formTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      return NextResponse.json(
        { error: "Form template not found" },
        { status: 404 }
      )
    }

    const version = await prisma.formTemplateVersion.create({
      data: {
        ...data,
        templateId
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    })

    return NextResponse.json(version)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("[FORM_VERSIONS_POST]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 