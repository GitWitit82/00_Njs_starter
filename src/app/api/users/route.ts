import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { RouteHandler } from "@/lib/auth-utils"
import { Role } from "@prisma/client"

export const GET = RouteHandler(async () => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}, Role.ADMIN)

export const POST = RouteHandler(async (req) => {
  try {
    const { name, email, role } = await req.json()
    const user = await prisma.user.create({
      data: { name, email, role }
    })
    return NextResponse.json(user)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}, Role.ADMIN) 