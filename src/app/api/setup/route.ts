import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    // Delete existing admin user if exists
    await prisma.user.deleteMany({
      where: { name: "admin" }
    })

    // Create admin user with simple password
    const password = "1234"
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const admin = await prisma.user.create({
      data: {
        name: "admin",
        password: hashedPassword,
        role: Role.ADMIN
      }
    })

    return NextResponse.json({ 
      message: "Admin user created successfully", 
      user: {
        name: admin.name,
        role: admin.role
      }
    })
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json(
      { message: "Failed to create admin user", error: String(error) }, 
      { status: 500 }
    )
  }
} 