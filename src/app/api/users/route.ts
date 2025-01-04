import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  role: z.enum(["ADMIN", "MANAGER", "USER"]),
})

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || !["ADMIN", "MANAGER"].includes(user.role)) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[USERS_GET]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const body = await req.json()
    const validatedFields = userSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", issues: validatedFields.error.issues },
        { status: 400 }
      )
    }

    const { name, password, role } = validatedFields.data

    const existingUser = await db.user.findUnique({
      where: { name },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await db.user.create({
      data: {
        name,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(newUser)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[USERS_POST]", error.message)
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 