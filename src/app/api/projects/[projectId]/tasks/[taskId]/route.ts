/**
 * @file api/projects/[projectId]/tasks/[taskId]/route.ts
 * @description API route for handling project task updates
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateTaskSchema = z.object({
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "ON_HOLD", "COMPLETED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const task = await prisma.projectTask.findFirst({
      where: {
        id: params.taskId,
        projectId: params.projectId,
      },
      include: {
        assignedTo: true,
        taskActivities: {
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
    console.error("Error fetching task:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { projectId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    const activityType = validatedData.status ? "STATUS_CHANGE" : "PRIORITY_CHANGE";
    const activityDetails = validatedData.status
      ? `Status changed to ${validatedData.status.toLowerCase().replace("_", " ")}`
      : `Priority changed to ${validatedData.priority?.toLowerCase()}`;

    const task = await prisma.projectTask.findFirst({
      where: {
        id: params.taskId,
        projectId: params.projectId,
      },
    });

    if (!task) {
      return new NextResponse("Task not found", { status: 404 });
    }

    const updatedTask = await prisma.projectTask.update({
      where: {
        id: params.taskId,
      },
      data: {
        ...validatedData,
        taskActivities: {
          create: {
            type: activityType,
            userId: session.user.id,
            details: activityDetails,
          },
        },
      },
      include: {
        assignedTo: true,
        taskActivities: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }

    console.error("Error updating task:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const task = await prisma.projectTask.findFirst({
      where: {
        id: params.taskId,
        projectId: params.projectId,
      },
      include: {
        taskActivities: true,
      },
    });

    if (!task) {
      return new NextResponse("Task not found", { status: 404 });
    }

    await prisma.projectTask.delete({
      where: {
        id: params.taskId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 