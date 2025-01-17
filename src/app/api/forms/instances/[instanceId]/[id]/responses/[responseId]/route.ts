import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { Prisma, FormResponseStatus } from "@prisma/client"

const responseStatusEnum = z.nativeEnum(FormResponseStatus)

const updateResponseSchema = z.object({
  data: z.unknown().optional(),
  metadata: z.unknown().optional(),
  status: responseStatusEnum.optional(),
  comments: z.string().optional(),
})

export async function GET(
  req: Request,
  { params }: { params: { instanceId: string; responseId: string } }
) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [formInstance, response] = await Promise.all([
      prisma.formInstance.findUnique({
        where: { id: params.instanceId },
        select: { id: true },
      }),
      prisma.formResponse.findFirst({
        where: {
          id: params.responseId,
          instanceId: params.instanceId,
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

export async function PATCH(
  req: Request,
  { params }: { params: { instanceId: string; responseId: string } }
) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await req.json()
    const body = updateResponseSchema.parse(json)

    const [user, formInstance, existingResponse] = await Promise.all([
      prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      }),
      prisma.formInstance.findUnique({
        where: { id: params.instanceId },
        select: { id: true },
      }),
      prisma.formResponse.findFirst({
        where: {
          id: params.responseId,
          instanceId: params.instanceId,
        },
        select: { status: true },
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

    if (!existingResponse) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 })
    }

    if (body.status && existingResponse.status !== FormResponseStatus.DRAFT && !["APPROVED", "REJECTED"].includes(body.status)) {
      return NextResponse.json(
        { error: "Cannot update status of non-draft response" },
        { status: 400 }
      )
    }

    const response = await prisma.$transaction(async (tx) => {
      const response = await tx.formResponse.update({
        where: {
          id: params.responseId,
        },
        data: {
          ...(body.data && { data: body.data as Prisma.JsonObject }),
          ...(body.metadata && { metadata: body.metadata as Prisma.JsonObject }),
          ...(body.status && { status: body.status }),
          ...(body.comments && { comments: body.comments }),
          ...(body.status === FormResponseStatus.SUBMITTED && {
            submittedAt: new Date(),
            submittedById: user.id,
          }),
          ...([FormResponseStatus.APPROVED, FormResponseStatus.REJECTED].includes(body.status as FormResponseStatus) && {
            reviewedAt: new Date(),
            reviewedById: user.id,
          }),
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
        },
      })

      await tx.formResponseHistory.create({
        data: {
          responseId: response.id,
          data: response.data as Prisma.JsonObject,
          metadata: response.metadata as Prisma.JsonObject,
          status: response.status,
          changedById: user.id,
          changeType: body.status || "UPDATED",
          comments: body.comments,
        },
      })

      return response
    })

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 422 }
      )
    }

    console.error("[FORM_RESPONSE_PATCH]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { instanceId: string; responseId: string } }
) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [formInstance, response] = await Promise.all([
      prisma.formInstance.findUnique({
        where: { id: params.instanceId },
        select: { id: true },
      }),
      prisma.formResponse.findFirst({
        where: {
          id: params.responseId,
          instanceId: params.instanceId,
        },
        select: { status: true },
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

    if (response.status !== FormResponseStatus.DRAFT) {
      return NextResponse.json(
        { error: "Only draft responses can be deleted" },
        { status: 400 }
      )
    }

    await prisma.formResponse.delete({
      where: {
        id: params.responseId,
      },
    })

    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    console.error("[FORM_RESPONSE_DELETE]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 