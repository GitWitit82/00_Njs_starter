/**
 * @file api/tasks/[taskId]/route.ts
 * @description API route for handling task updates
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

    const activityType = validatedData.status ? "STATUS_CHANGE" : "PRIORITY_CHANGE";
    const activityDetails = validatedData.status
      ? `Status changed to ${validatedData.status.toLowerCase().replace("_", " ")}`
      : `Priority changed to ${validatedData.priority?.toLowerCase()}`;

    const task = await prisma.projectTask.update({
      where: { id: params.taskId },
      data: {
        ...validatedData,
        activity: {
          create: {
            type: activityType,
            userId: session.user.id,
            details: activityDetails,
          },
        },
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

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }

    console.error("Error updating task:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 