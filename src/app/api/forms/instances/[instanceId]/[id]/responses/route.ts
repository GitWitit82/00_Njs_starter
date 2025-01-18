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
        responses: {
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
          },
        },
      },
    })

    if (!formInstance) {
      return NextResponse.json(
        { error: "Form instance not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(formInstance.responses)
  } catch (error) {
    console.error("[FORM_RESPONSES_GET]", error)
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
    const { data, metadata } = await request.json()

    const [user, formInstance] = await Promise.all([
      prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      }),
      prisma.formInstance.findUnique({
        where: { id: instanceId },
        select: { id: true },
      }),
    ])

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!formInstance) {
      return NextResponse.json(
        { error: "Form instance not found" },
        { status: 404 }
      )
    }

    const response = await prisma.formResponse.create({
      data: {
        instanceId,
        data,
        metadata,
        submittedById: user.id,
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("[FORM_RESPONSES_POST]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 