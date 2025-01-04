import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Check if admin user already exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      name: "Admin User",
      role: "ADMIN",
    },
  })

  if (existingAdmin) {
    console.log("Admin user already exists")
    return
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash("1234", 10)
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  console.log("Admin user created successfully:", admin)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 