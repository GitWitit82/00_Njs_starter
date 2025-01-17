import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { FormInstanceStatus } from "@prisma/client"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

/**
 * GET /api/forms/instances/[instanceId]/dependencies
 * Gets the dependency graph for a form instance
 */
export async function GET(
  request: Request,
  { params }: { params: { instanceId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const instance = await prisma.formInstance.findUnique({
    where: { id: params.instanceId },
    include: {
      template: {
        include: {
          formCompletionRequirements: {
            include: {
              dependsOn: true,
            },
          },
        },
      },
    },
  })

  if (!instance) {
    return NextResponse.json(
      { error: "Form instance not found" },
      { status: 404 }
    )
  }

  const dependencies = await prisma.formInstance.findMany({
    where: {
      id: {
        in: instance.template.formCompletionRequirements
          .flatMap((req) => req.dependsOn.map((dep) => dep.id))
          .filter((id): id is string => id !== null),
      },
    },
    include: {
      template: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  const dependencyGraph = dependencies.map((dep) => ({
    id: dep.id,
    name: dep.template.name,
    status: dep.status,
    requiredStatus: instance.template.formCompletionRequirements
      .flatMap((req) => req.dependsOn)
      .find((d) => d.id === dep.id)?.status,
  }))

  return NextResponse.json(dependencyGraph)
}

/**
 * POST /api/forms/instances/[instanceId]/dependencies
 * Updates form dependencies
 */
export async function POST(
  request: Request,
  { params }: { params: { instanceId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const instance = await prisma.formInstance.findUnique({
    where: { id: params.instanceId },
    include: {
      template: true,
    },
  })

  if (!instance) {
    return NextResponse.json(
      { error: "Form instance not found" },
      { status: 404 }
    )
  }

  const body = await request.json()
  const { dependencyId, status } = body

  const requirement = await prisma.formCompletionRequirement.create({
    data: {
      templateId: instance.template.id,
      dependsOn: {
        create: {
          id: dependencyId,
          status: status as FormInstanceStatus,
        },
      },
    },
  })

  return NextResponse.json(requirement)
}

export async function DELETE(
  request: Request,
  { params }: { params: { instanceId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const instance = await prisma.formInstance.findUnique({
    where: { id: params.instanceId },
    include: {
      template: true,
    },
  })

  if (!instance) {
    return NextResponse.json(
      { error: "Form instance not found" },
      { status: 404 }
    )
  }

  const { searchParams } = new URL(request.url)
  const dependencyId = searchParams.get("dependencyId")

  if (!dependencyId) {
    return NextResponse.json(
      { error: "Dependency ID is required" },
      { status: 400 }
    )
  }

  await prisma.formCompletionRequirement.deleteMany({
    where: {
      templateId: instance.template.id,
      dependsOn: {
        some: {
          id: dependencyId,
        },
      },
    },
  })

  return NextResponse.json({ success: true })
} 