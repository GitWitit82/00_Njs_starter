import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = params

    if (!id) {
      return new NextResponse("Template ID is required", { status: 400 })
    }

    // Count instances of this template
    const count = await db.formInstance.count({
      where: { templateId: id },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("[TEMPLATE_INSTANCES]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 