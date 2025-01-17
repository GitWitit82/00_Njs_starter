import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checkFormCompletion } from '@/lib/utils/form-status'

export async function PATCH(
  request: Request,
  { params }: { params: { instanceId: string } }
) {
  try {
    const { status } = await request.json()

    const instance = await db.formInstance.findUnique({
      where: { id: params.instanceId },
      include: {
        template: {
          include: {
            schema: true
          }
        },
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!instance) {
      return new NextResponse('Form instance not found', { status: 404 })
    }

    if (status === 'COMPLETED' && !checkFormCompletion(instance)) {
      return new NextResponse('Form is incomplete', { status: 400 })
    }

    const updatedInstance = await db.formInstance.update({
      where: { id: params.instanceId },
      data: { status }
    })

    return NextResponse.json(updatedInstance)
  } catch (error) {
    console.error('Error updating form status:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 