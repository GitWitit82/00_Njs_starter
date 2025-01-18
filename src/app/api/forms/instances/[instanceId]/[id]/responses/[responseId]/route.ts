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
    const responseId = paths[paths.indexOf("responses") + 1]

    const [formInstance, response] = await Promise.all([
      prisma.formInstance.findUnique({
        where: { id: instanceId },
        select: { id: true },
      }),
      prisma.formResponse.findFirst({
        where: {
          id: responseId,
          instanceId: instanceId,
        },
        include: {
          submittedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          history: {
            orderBy: {
              changedAt: "desc",
            },
            take: 5,
            include: {
              changedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
    ])

    if (!formInstance) {
      return NextResponse.json(
        { error: "Form instance not found" },
        { status: 404 }
      )
    }

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[FORM_RESPONSE_GET]", error)
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
    const responseId = paths[paths.indexOf("responses") + 1]

    const formInstance = await prisma.formInstance.findUnique({
      where: { id: instanceId },
      select: { id: true }
    })

    if (!formInstance) {
      return NextResponse.json(
        { error: "Form instance not found" },
        { status: 404 }
      )
    }

    const response = await prisma.formResponse.findFirst({
      where: {
        id: responseId,
        instanceId: instanceId
      }
    })

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 })
    }

    await prisma.formResponse.delete({
      where: { id: responseId }
    })

    return NextResponse.json({ message: "Response deleted successfully" })
  } catch (error) {
    console.error("[FORM_RESPONSE_DELETE]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 