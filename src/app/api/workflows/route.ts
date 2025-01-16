import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const workflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isTemplate: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

/**
 * GET /api/workflows
 * Retrieves all workflows with optional filtering
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const isTemplate = searchParams.get('isTemplate') === 'true';
    const status = searchParams.get('status');

    const workflows = await prisma.workflow.findMany({
      where: {
        isTemplate: isTemplate,
        status: status as any || undefined,
      },
      include: {
        phases: {
          include: {
            tasks: true,
          },
        },
        formTemplates: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ data: workflows });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows
 * Creates a new workflow template
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const body = workflowSchema.parse(json);

    const workflow = await prisma.workflow.create({
      data: {
        name: body.name,
        description: body.description,
        isTemplate: body.isTemplate,
        metadata: body.metadata,
        status: 'ACTIVE',
        version: 1,
      },
      include: {
        phases: true,
      },
    });

    return NextResponse.json({ data: workflow });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workflows/:id
 * Updates an existing workflow
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const body = workflowSchema.parse(json);
    const id = req.url.split('/').pop();

    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        metadata: body.metadata,
      },
      include: {
        phases: true,
      },
    });

    return NextResponse.json({ data: workflow });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/:id
 * Deletes a workflow template
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = req.url.split('/').pop();

    // Instead of deleting, mark as archived
    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
      },
    });

    return NextResponse.json({ data: workflow });
  } catch (error) {
    console.error('Error archiving workflow:', error);
    return NextResponse.json(
      { error: 'Failed to archive workflow' },
      { status: 500 }
    );
  }
} 