import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { FormInstanceStatus, Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const responseSchema = z.object({
  data: z.unknown().default({}),
  metadata: z.unknown().optional(),
  status: z.nativeEnum(FormInstanceStatus).optional()
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const response = await prisma.formResponse.findUnique({
    where: { id: params.id },
    include: {
      instance: {
        include: {
          template: true,
          activities: {
            orderBy: {
              createdAt: "desc"
            },
            take: 5
          }
        }
      },
      reviewer: true
    }
  })

  if (!response) {
    return NextResponse.json(
      { error: "Form response not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(response)
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const validatedBody = responseSchema.parse(await request.json())

  const response = await prisma.formResponse.findUnique({
    where: { id: params.id },
    include: {
      instance: true
    }
  })

  if (!response) {
    return NextResponse.json(
      { error: "Form response not found" },
      { status: 404 }
    )
  }

  const updatedResponse = await prisma.formResponse.update({
    where: { id: params.id },
    data: {
      data: validatedBody.data as Prisma.JsonObject,
      metadata: validatedBody.metadata as Prisma.JsonObject | null,
      reviewedAt: validatedBody.status ? new Date() : undefined,
      reviewerId: validatedBody.status ? session.user.id : undefined,
      instance: validatedBody.status
        ? {
            update: {
              status: validatedBody.status,
              activities: {
                create: {
                  type: "STATUS_CHANGE",
                  content: `Status changed to ${validatedBody.status}`,
                  userId: session.user.id
                }
              }
            }
          }
        : undefined
    },
    include: {
      instance: {
        include: {
          template: true,
          activities: {
            orderBy: {
              createdAt: "desc"
            },
            take: 5
          }
        }
      },
      reviewer: true
    }
  })

  return NextResponse.json(updatedResponse)
} 