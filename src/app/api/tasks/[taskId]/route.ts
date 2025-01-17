/**
 * @file api/tasks/[taskId]/route.ts
 * @description API route for handling task updates
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskStatus, Priority } from "@prisma/client";

/**
 * Schema for validating task update requests
 */
const updateTaskSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  assignedToId: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
});

/**
 * PATCH handler for updating tasks
 */
export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    // Determine activity type and content
    let activityType: "STATUS_CHANGE" | "PRIORITY_CHANGE" | "ASSIGNMENT" = "STATUS_CHANGE";
    let content = "";

    if (validatedData.status) {
      activityType = "STATUS_CHANGE";
      content = `Status changed to ${validatedData.status.toLowerCase().replace("_", " ")}`;
    } else if (validatedData.priority) {
      activityType = "PRIORITY_CHANGE";
      content = `Priority changed to ${validatedData.priority.toLowerCase()}`;
    } else if (validatedData.assignedToId !== undefined) {
      activityType = "ASSIGNMENT";
      content = validatedData.assignedToId
        ? "Task assigned to user"
        : "Task unassigned";
    }

    const task = await prisma.projectTask.update({
      where: { id: params.taskId },
      data: {
        ...validatedData,
        activity: {
          create: {
            type: activityType,
            content,
            userId: session.user.id,
          },
        },
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        activity: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }

    console.error("Error updating task:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 