import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

const phaseSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().min(0),
  estimatedDuration: z.number().int().min(1).optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * GET /api/workflows/:workflowId/phases
 * Retrieves all phases for a workflow
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract workflowId from URL
    const urlParts = request.url.split('/');
    const workflowId = urlParts[urlParts.indexOf('workflows') + 1];

    const phases = await prisma.phase.findMany({
      where: {
        workflowId: workflowId,
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
    console.error('[GET] /api/workflows/[workflowId]/phases error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows/:workflowId/phases
 * Creates a new phase in a workflow
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract workflowId from URL
    const urlParts = request.url.split('/');
    const workflowId = urlParts[urlParts.indexOf('workflows') + 1];

    const json = await request.json();
    const body = phaseSchema.parse(json);

    // Get the current highest order
    const highestOrder = await prisma.phase.findFirst({
      where: { workflowId: workflowId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const phase = await prisma.phase.create({
      data: {
        name: body.name,
        description: body.description,
        order: body.order ?? (highestOrder?.order ?? -1) + 1,
        estimatedDuration: body.estimatedDuration,
        metadata: body.metadata,
        workflow: {
          connect: { id: workflowId },
        },
      },
      include: {
        tasks: true,
        formTemplates: true,
      },
    });

    return NextResponse.json(phase);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[POST] /api/workflows/[workflowId]/phases error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workflows/:workflowId/phases/:phaseId
 * Updates an existing phase
 */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract IDs from URL
    const urlParts = request.url.split('/');
    const workflowId = urlParts[urlParts.indexOf('workflows') + 1];
    const phaseId = urlParts[urlParts.indexOf('phases') + 1];

    const json = await request.json();
    const body = phaseSchema.parse(json);

    const phase = await prisma.phase.update({
      where: {
        id: phaseId,
        workflowId: workflowId,
      },
      data: {
        name: body.name,
        description: body.description,
        order: body.order,
        estimatedDuration: body.estimatedDuration,
        metadata: body.metadata,
      },
      include: {
        tasks: true,
        formTemplates: true,
      },
    });

    return NextResponse.json(phase);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[PUT] /api/workflows/[workflowId]/phases/[phaseId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/:workflowId/phases/:phaseId
 * Deletes a phase and reorders remaining phases
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract IDs from URL
    const urlParts = request.url.split('/');
    const workflowId = urlParts[urlParts.indexOf('workflows') + 1];
    const phaseId = urlParts[urlParts.indexOf('phases') + 1];

    // Start a transaction to handle phase deletion and reordering
    const result = await prisma.$transaction(async (tx) => {
      // Get the phase to be deleted
      const phase = await tx.phase.findUnique({
        where: { id: phaseId },
        select: { order: true },
      });

      if (!phase) {
        throw new Error('Phase not found');
      }

      // Delete the phase
      await tx.phase.delete({
        where: { id: phaseId },
      });

      // Reorder remaining phases
      await tx.phase.updateMany({
        where: {
          workflowId: workflowId,
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
        where: { workflowId: workflowId },
        orderBy: { order: 'asc' },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[DELETE] /api/workflows/[workflowId]/phases/[phaseId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 