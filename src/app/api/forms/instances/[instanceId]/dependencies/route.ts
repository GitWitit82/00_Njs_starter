import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const instanceId = paths[paths.indexOf("instances") + 1]

    const formInstance = await prisma.formInstance.findUnique({
      where: { id: instanceId },
      include: {
        template: {
          include: {
            completionRequirements: {
              include: {
                dependsOn: true
              }
            }
          }
        }
      }
    })

    if (!formInstance) {
      return NextResponse.json(
        { error: "Form instance not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(formInstance.template.completionRequirements)
  } catch (error) {
    console.error("[FORM_INSTANCE_DEPENDENCIES_GET]", error)
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
    const instanceId = paths[paths.indexOf("instances") + 1]
    const { dependencyId } = await request.json()

    const formInstance = await prisma.formInstance.findUnique({
      where: { id: instanceId },
      include: {
        template: {
          include: {
            completionRequirements: {
              include: {
                dependsOn: true
              }
            }
          }
        }
      }
    })

    if (!formInstance) {
      return NextResponse.json(
        { error: "Form instance not found" },
        { status: 404 }
      )
    }

    const dependency = await prisma.formInstance.findUnique({
      where: { id: dependencyId },
      include: {
        template: true
      }
    })

    if (!dependency) {
      return NextResponse.json(
        { error: "Dependency not found" },
        { status: 404 }
      )
    }

    const requirement = await prisma.formCompletionRequirement.create({
      data: {
        templateId: formInstance.template.id,
        dependsOnId: dependency.template.id
      },
      include: {
        dependsOn: true
      }
    })

    return NextResponse.json(requirement)
  } catch (error) {
    console.error("[FORM_INSTANCE_DEPENDENCIES_POST]", error)
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
    const instanceId = paths[paths.indexOf("instances") + 1]
    const { dependencyId } = await request.json()

    const formInstance = await prisma.formInstance.findUnique({
      where: { id: instanceId },
      include: {
        template: {
          include: {
            completionRequirements: {
              include: {
                dependsOn: true
              }
            }
          }
        }
      }
    })

    if (!formInstance) {
      return NextResponse.json(
        { error: "Form instance not found" },
        { status: 404 }
      )
    }

    const requirement = await prisma.formCompletionRequirement.findFirst({
      where: {
        templateId: formInstance.template.id,
        dependsOnId: dependencyId
      }
    })

    if (!requirement) {
      return NextResponse.json(
        { error: "Dependency requirement not found" },
        { status: 404 }
      )
    }

    await prisma.formCompletionRequirement.delete({
      where: { id: requirement.id }
    })

    return NextResponse.json({ message: "Dependency removed successfully" })
  } catch (error) {
    console.error("[FORM_INSTANCE_DEPENDENCIES_DELETE]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 