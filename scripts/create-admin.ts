const { PrismaClient } = require("@prisma/client")
const { hash } = require("bcrypt")

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        name: "admin",
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
        name: "admin",
        email: "admin@example.com",
        hashedPassword: hashedPassword,
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