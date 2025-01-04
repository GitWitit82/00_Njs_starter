import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: "admin@example.com",
        role: "ADMIN",
      },
    })

    if (existingAdmin) {
      console.log("Admin user already exists")
      return
    }

    // Create admin user
    const hashedPassword = await hash("1234", 10)
    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    })

    console.log("Admin user created successfully:", admin)
  } catch (error) {
    console.error("Error creating admin user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 