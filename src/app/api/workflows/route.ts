import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const workflows = await prisma.workflow.findMany({
      include: {
        phases: true,
      },
    });

    return NextResponse.json(workflows);
  } catch {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, description } = data;

    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(workflow);
  } catch {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 