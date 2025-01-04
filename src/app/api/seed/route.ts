import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { db } from "@/lib/db"

/**
 * POST handler for seeding admin user
 */
export async function POST() {
  try {
    // Check if admin user already exists
    const existingAdmin = await db.user.findFirst({
      where: {
        email: "admin@example.com",
        role: "ADMIN",
      },
    })

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin user already exists" },
        { status: 400 }
      )
    }

    // Create admin user
    const hashedPassword = await hash("1234", 10)
    const admin = await db.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json(
      {
        message: "Admin user created successfully",
        user: admin,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 }
    )
  }
} 