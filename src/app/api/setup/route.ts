import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { name: "admin" }
    })

    if (existingAdmin) {
      return NextResponse.json({ message: "Admin user already exists" })
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("1234", 10)
    
    const admin = await prisma.user.create({
      data: {
        name: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: Role.ADMIN
      }
    })

    return NextResponse.json({ message: "Admin user created successfully", user: admin })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Failed to create admin user" }, { status: 500 })
  }
} 