import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const workflow = await db.workflow.findUnique({
      where: { id: params.workflowId },
      include: {
        phases: {
          include: {
            tasks: true
          }
        }
      }
    })

    if (!workflow) {
      return new NextResponse('Workflow not found', { status: 404 })
    }

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('Error fetching workflow:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { name, description } = await request.json()

    const workflow = await db.workflow.update({
      where: { id: params.workflowId },
      data: { name, description }
    })

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('Error updating workflow:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    await db.workflow.delete({
      where: { id: params.workflowId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting workflow:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 