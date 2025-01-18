import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import * as z from 'zod'

const workflowSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
})

/**
 * GET /api/workflows/:workflowId
 * Retrieves a specific workflow with its phases and tasks
 */
export async function GET(
  request: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: params.workflowId },
      include: {
        phases: {
          include: {
            tasks: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('[WORKFLOW_GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/workflows/:workflowId
 * Updates a specific workflow
 */
export async function PATCH(
  request: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const result = workflowSchema.safeParse(json)

    if (!result.success) {
      const { errors } = result.error
      return NextResponse.json(
        { error: 'Invalid request', errors },
        { status: 400 }
      )
    }

    const workflow = await prisma.workflow.update({
      where: { id: params.workflowId },
      data: {
        name: result.data.name,
        description: result.data.description,
      }
    })

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('[WORKFLOW_PATCH]', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 })
  }
}

/**
 * DELETE /api/workflows/:workflowId
 * Deletes a specific workflow
 */
export async function DELETE(
  request: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.workflow.delete({
      where: { id: params.workflowId }
    })

    return NextResponse.json({ message: 'Workflow deleted successfully' })
  } catch (error) {
    console.error('[WORKFLOW_DELETE]', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 })
  }
} 