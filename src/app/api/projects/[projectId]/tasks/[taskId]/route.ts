import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/**
 * Schema for validating task update requests
 */
const taskUpdateSchema = z.object({
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "ON_HOLD", "COMPLETED"]).optional(),
  assignedToId: z.string().nullable().optional(),
  comment: z.string().optional(),
});

/**
 * PATCH /api/projects/[projectId]/tasks/[taskId]
 * Updates a task's status, assignee, or adds a comment
 */
export async function PATCH(
  req: Request,
  { params }: { params: { projectId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = taskUpdateSchema.parse(body);

    // Get current task data for activity logging
    const currentTask = await prisma.projectTask.findUnique({
      where: {
        id: params.taskId,
        projectId: params.projectId,
      },
      include: {
        assignedTo: true,
      },
    });

    if (!currentTask) {
      return new NextResponse("Task not found", { status: 404 });
    }

    // Start a transaction for task update and activity logging
    const updatedTask = await prisma.$transaction(async (tx) => {
      // Update task
      const task = await tx.projectTask.update({
        where: {
          id: params.taskId,
          projectId: params.projectId,
        },
        data: {
          ...(validatedData.status && { status: validatedData.status }),
          ...(validatedData.assignedToId !== undefined && {
            assignedToId: validatedData.assignedToId,
          }),
        },
        include: {
          assignedTo: true,
        },
      });

      // Log status change activity
      if (validatedData.status && validatedData.status !== currentTask.status) {
        await tx.taskActivity.create({
          data: {
            taskId: params.taskId,
            userId: session.user.id,
            type: "STATUS_CHANGE",
            content: validatedData.status,
          },
        });
      }

      // Log assignment change activity
      if (validatedData.assignedToId !== undefined && 
          validatedData.assignedToId !== currentTask.assignedToId) {
        const newAssignee = validatedData.assignedToId
          ? await tx.user.findUnique({
              where: { id: validatedData.assignedToId },
              select: { name: true },
            })
          : null;

        await tx.taskActivity.create({
          data: {
            taskId: params.taskId,
            userId: session.user.id,
            type: "ASSIGNMENT",
            content: newAssignee?.name || "",
          },
        });
      }

      // Log comment activity
      if (validatedData.comment) {
        await tx.taskActivity.create({
          data: {
            taskId: params.taskId,
            userId: session.user.id,
            type: "COMMENT",
            content: validatedData.comment,
          },
        });
      }

      return task;
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }

    return new NextResponse("Internal error", { status: 500 });
  }
}

/**
 * GET /api/projects/[projectId]/tasks/[taskId]
 * Retrieves task details including activity history
 */
export async function GET(
  req: Request,
  { params }: { params: { projectId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const task = await prisma.projectTask.findUnique({
      where: {
        id: params.taskId,
        projectId: params.projectId,
      },
      include: {
        assignedTo: true,
        activity: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!task) {
      return new NextResponse("Task not found", { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
} 