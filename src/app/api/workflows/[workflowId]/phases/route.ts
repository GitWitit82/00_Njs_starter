import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

const phaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  order: z.number().int().min(0, "Order must be a positive number"),
  estimatedDuration: z.number().int().min(1).optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * GET /api/workflows/:workflowId/phases
 * Retrieves all phases for a workflow
 */
export async function GET(
  request: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const phases = await prisma.phase.findMany({
      where: {
        workflowId: params.workflowId,
      },
      include: {
        tasks: {
          include: {
            department: true,
            dependencies: true,
            dependsOn: true,
          },
        },
        formTemplates: {
          include: {
            department: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(phases);
  } catch (error) {
    console.error('[PHASES_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch phases' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows/:workflowId/phases
 * Creates a new phase in a workflow
 */
export async function POST(
  request: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const result = phaseSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.errors },
        { status: 400 }
      );
    }

    // Get the current highest order
    const highestOrder = await prisma.phase.findFirst({
      where: { workflowId: params.workflowId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const phase = await prisma.phase.create({
      data: {
        name: result.data.name,
        description: result.data.description,
        order: result.data.order ?? (highestOrder?.order ?? -1) + 1,
        estimatedDuration: result.data.estimatedDuration,
        metadata: result.data.metadata,
        workflow: {
          connect: { id: params.workflowId },
        },
      },
      include: {
        tasks: true,
        formTemplates: true,
      },
    });

    return NextResponse.json(phase);
  } catch (error) {
    console.error('[PHASES_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create phase' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workflows/:workflowId/phases/:phaseId
 * Updates an existing phase
 */
export async function PUT(
  request: Request,
  { params }: { params: { workflowId: string; phaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const result = phaseSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.errors },
        { status: 400 }
      );
    }

    const phase = await prisma.phase.update({
      where: {
        id: params.phaseId,
        workflowId: params.workflowId,
      },
      data: {
        name: result.data.name,
        description: result.data.description,
        order: result.data.order,
        estimatedDuration: result.data.estimatedDuration,
        metadata: result.data.metadata,
      },
      include: {
        tasks: true,
        formTemplates: true,
      },
    });

    return NextResponse.json(phase);
  } catch (error) {
    console.error('[PHASES_PUT]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update phase' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/:workflowId/phases/:phaseId
 * Deletes a phase and reorders remaining phases
 */
export async function DELETE(
  request: Request,
  { params }: { params: { workflowId: string; phaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Start a transaction to handle phase deletion and reordering
    const result = await prisma.$transaction(async (tx) => {
      // Get the phase to be deleted
      const phase = await tx.phase.findUnique({
        where: { id: params.phaseId },
        select: { order: true },
      });

      if (!phase) {
        throw new Error('Phase not found');
      }

      // Delete the phase
      await tx.phase.delete({
        where: { id: params.phaseId },
      });

      // Reorder remaining phases
      await tx.phase.updateMany({
        where: {
          workflowId: params.workflowId,
          order: {
            gt: phase.order,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      });

      // Get updated phases list
      return tx.phase.findMany({
        where: { workflowId: params.workflowId },
        orderBy: { order: 'asc' },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[PHASES_DELETE]', error);
    if (error.message === 'Phase not found') {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to delete phase' },
      { status: 500 }
    );
  }
} 