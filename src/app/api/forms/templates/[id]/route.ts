import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const templateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  phaseId: z.string().optional(),
  metadata: z.unknown().optional()
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const template = await prisma.formTemplate.findUnique({
    where: { id: params.id },
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
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const validatedBody = templateSchema.partial().parse(await request.json())

  const template = await prisma.formTemplate.findUnique({
    where: { id: params.id }
  })

  if (!template) {
    return NextResponse.json(
      { error: "Form template not found" },
      { status: 404 }
    )
  }

  const updatedTemplate = await prisma.formTemplate.update({
    where: { id: params.id },
    data: {
      name: validatedBody.name,
      description: validatedBody.description,
      projectId: validatedBody.projectId,
      taskId: validatedBody.taskId,
      phaseId: validatedBody.phaseId,
      metadata: validatedBody.metadata as Prisma.JsonObject | null
    },
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

  return NextResponse.json(updatedTemplate)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const template = await prisma.formTemplate.findUnique({
    where: { id: params.id },
    include: {
      versions: true,
      instances: true
    }
  })

  if (!template) {
    return NextResponse.json(
      { error: "Form template not found" },
      { status: 404 }
    )
  }

  // Don't allow deletion if there are instances using this template
  if (template.instances.length > 0) {
    return NextResponse.json(
      { error: "Cannot delete template with existing instances" },
      { status: 400 }
    )
  }

  // Delete all versions and the template
  await prisma.$transaction([
    prisma.formTemplateVersion.deleteMany({
      where: { templateId: params.id }
    }),
    prisma.formTemplate.delete({
      where: { id: params.id }
    })
  ])

  return NextResponse.json({ success: true })
} 