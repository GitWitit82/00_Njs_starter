import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import { createProjectFromWorkflow } from "@/lib/services/project.service"

/**
 * Schema for validating project creation request
 */
const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  projectType: z.enum(["VEHICLE_WRAP", "SIGN", "MURAL"]),
  customerName: z.string().min(1, "Customer name is required"),
  vinNumber: z.string().optional(),
  workflowId: z.string().min(1, "Workflow ID is required"),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
})

/**
 * POST /api/projects
 * Creates a new project from a workflow template
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = createProjectSchema.parse(json)

    // Additional validation for vehicle wrap projects
    if (body.projectType === "VEHICLE_WRAP" && !body.vinNumber) {
      return new NextResponse(
        "VIN number is required for vehicle wrap projects",
        { status: 400 }
      )
    }

    const project = await createProjectFromWorkflow({
      ...body,
      managerId: session.user.id,
    })

    return NextResponse.json(project)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }

    console.error("[PROJECTS]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * GET /api/projects
 * Gets all projects or filters by type
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectType = searchParams.get("type")

    const where = projectType ? {
      projectType: projectType as "VEHICLE_WRAP" | "SIGN" | "MURAL"
    } : {}

    const projects = await prisma.project.findMany({
      where,
      include: {
        phases: {
          include: {
            tasks: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("[PROJECTS]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 