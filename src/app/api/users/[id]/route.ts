import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"
import { z } from "zod"

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "MANAGER", "USER"]),
})

/**
 * PUT handler for updating a user
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const body = await req.json()
    const { name, email, role } = userSchema.parse(body)

    // Check if email is already taken by another user
    const existingUser = await db.user.findFirst({
      where: {
        email,
        NOT: {
          id: params.id,
        },
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already taken" },
        { status: 400 }
      )
    }

    const user = await db.user.update({
      where: { id: params.id },
      data: {
        name,
        email,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler for deleting a user
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Prevent deleting the last admin user
    if (currentUser.id === params.id) {
      const adminCount = await db.user.count({
        where: { role: "ADMIN" },
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last admin user" },
          { status: 400 }
        )
      }
    }

    await db.user.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
} 