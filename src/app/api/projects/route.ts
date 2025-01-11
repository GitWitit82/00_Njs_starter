import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

const projectSchema = z.object({
  projectName: z.string().min(2),
  date: z.string().datetime(),
  vinNumber: z.string().length(17),
  invoiceNumber: z.string().min(1),
  projectTypes: z.array(z.string()),
})

/**
 * POST /api/projects
 * Creates a new project with the provided details
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = projectSchema.parse(json)

    const project = await prisma.project.create({
      data: {
        name: body.projectName,
        startDate: new Date(body.date),
        vinNumber: body.vinNumber,
        invoiceNumber: body.invoiceNumber,
        projectTypes: body.projectTypes,
        status: "PENDING",
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    })

    // Get the vehicle wrap workflow
    const workflow = await prisma.workflow.findFirst({
      where: {
        name: "Vehicle Wrap Workflow",
      },
      include: {
        phases: {
          include: {
            tasks: true,
          },
        },
      },
    })

    if (!workflow) {
      return new NextResponse("Workflow not found", { status: 404 })
    }

    // Associate workflow with project
    await prisma.project.update({
      where: {
        id: project.id,
      },
      data: {
        workflowId: workflow.id,
      },
    })

    // Create project tasks from workflow tasks
    for (const phase of workflow.phases) {
      for (const task of phase.tasks) {
        await prisma.projectTask.create({
          data: {
            name: task.name,
            description: task.description,
            status: "PENDING",
            priority: task.priority,
            order: task.order,
            projectId: project.id,
            phaseId: phase.id,
            workflowTaskId: task.id,
            createdById: session.user.id,
            updatedById: session.user.id,
          },
        })
      }
    }

    // Get form templates associated with the workflow
    const formTemplates = await prisma.formTemplate.findMany({
      where: {
        workflowId: workflow.id,
      },
    })

    // Create form instances for the project
    for (const template of formTemplates) {
      await prisma.formInstance.create({
        data: {
          name: template.name,
          description: template.description,
          status: "PENDING",
          projectId: project.id,
          formTemplateId: template.id,
          phaseId: template.phaseId,
          departmentId: template.departmentId,
          schema: template.schema,
          layout: template.layout,
          style: template.style,
          metadata: template.metadata,
          createdById: session.user.id,
          updatedById: session.user.id,
        },
      })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("[PROJECTS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 