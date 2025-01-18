import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/workflows/:workflowId
 * Retrieves a specific workflow with its phases and tasks
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract workflowId from URL
    const urlParts = request.url.split('/')
    const workflowId = urlParts[urlParts.indexOf('workflows') + 1]

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        phases: {
          include: {
            tasks: true
          }
        }
      }
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('[GET] /api/workflows/[workflowId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/workflows/:workflowId
 * Updates a specific workflow
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract workflowId from URL
    const urlParts = request.url.split('/')
    const workflowId = urlParts[urlParts.indexOf('workflows') + 1]

    const { name, description } = await request.json()

    const workflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: { name, description }
    })

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('[PATCH] /api/workflows/[workflowId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/workflows/:workflowId
 * Deletes a specific workflow
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract workflowId from URL
    const urlParts = request.url.split('/')
    const workflowId = urlParts[urlParts.indexOf('workflows') + 1]

    await prisma.workflow.delete({
      where: { id: workflowId }
    })

    return NextResponse.json({ message: 'Workflow deleted successfully' })
  } catch (error) {
    console.error('[DELETE] /api/workflows/[workflowId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 