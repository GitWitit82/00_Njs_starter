import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { FormInstanceStatus } from "@prisma/client"

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const instanceId = paths[paths.indexOf("instances") + 1]
    const { status } = await request.json()

    if (!Object.values(FormInstanceStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      )
    }

    const formInstance = await prisma.formInstance.findUnique({
      where: { id: instanceId }
    })

    if (!formInstance) {
      return NextResponse.json(
        { error: "Form instance not found" },
        { status: 404 }
      )
    }

    const updatedInstance = await prisma.formInstance.update({
      where: { id: instanceId },
      data: { status }
    })

    return NextResponse.json(updatedInstance)
  } catch (error) {
    console.error("[FORM_INSTANCE_STATUS_PATCH]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 