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
    const id = paths[paths.indexOf("responses") + 1]

    const response = await prisma.formResponse.findUnique({
      where: { id },
      include: {
        instance: {
          include: {
            template: true
          }
        },
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        history: {
          orderBy: {
            changedAt: "desc"
          },
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

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

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const id = paths[paths.indexOf("responses") + 1]
    const { data, metadata, status, comments } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const response = await prisma.formResponse.update({
      where: { id },
      data: {
        ...(data && { data }),
        ...(metadata && { metadata }),
        ...(status && { status }),
        ...(comments && { comments }),
        ...(status === "SUBMITTED" && {
          submittedAt: new Date(),
          submittedById: user.id
        }),
        ...((status === "APPROVED" || status === "REJECTED") && {
          reviewedAt: new Date(),
          reviewedById: user.id
        })
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    await prisma.formResponseHistory.create({
      data: {
        responseId: response.id,
        data: response.data,
        metadata: response.metadata,
        status: response.status,
        changedById: user.id,
        changeType: status || "UPDATED",
        comments
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("[FORM_RESPONSE_PATCH]", error)
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
    const id = paths[paths.indexOf("responses") + 1]

    const response = await prisma.formResponse.findUnique({
      where: { id }
    })

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 })
    }

    await prisma.formResponse.delete({
      where: { id }
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