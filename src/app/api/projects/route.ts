import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { RouteHandler } from "@/lib/auth-utils"
import { Role } from "@prisma/client"

export const GET = RouteHandler(async () => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        manager: true,
        tasks: {
          include: {
            assignee: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json(projects)
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}, Role.USER)

export const POST = RouteHandler(async (req: NextRequest) => {
  try {
    const data = await req.json()
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        managerId: data.managerId,
      },
      include: {
        manager: true,
        tasks: {
          include: {
            assignee: true,
          },
        },
      },
    })
    return NextResponse.json(project)
  } catch (error) {
    console.error("Failed to create project:", error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}, Role.MANAGER) 