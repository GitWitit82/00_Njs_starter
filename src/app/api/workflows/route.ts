import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as z from 'zod';

const workflowSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflows = await prisma.workflow.findMany({
      include: {
        phases: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error('[WORKFLOWS_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const result = workflowSchema.safeParse(json);

    if (!result.success) {
      const { errors } = result.error;
      return NextResponse.json(
        { error: 'Invalid request', errors },
        { status: 400 }
      );
    }

    const workflow = await prisma.workflow.create({
      data: {
        name: result.data.name,
        description: result.data.description,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('[WORKFLOWS_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
} 