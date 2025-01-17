import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checkFormCompletion } from '@/lib/utils/form-status'

export async function PATCH(request: Request) {
  try {
    const { instanceIds, status } = await request.json()

    if (!Array.isArray(instanceIds) || instanceIds.length === 0) {
      return new NextResponse('Invalid request: instanceIds must be a non-empty array', {
        status: 400
      })
    }

    const instances = await db.formInstance.findMany({
      where: { id: { in: instanceIds } },
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

    if (instances.length !== instanceIds.length) {
      return new NextResponse('One or more form instances not found', {
        status: 404
      })
    }

    // If updating to COMPLETED, check all forms are complete
    if (status === 'COMPLETED') {
      const incompleteInstances = instances.filter(
        instance => !checkFormCompletion(instance)
      )

      if (incompleteInstances.length > 0) {
        return new NextResponse(
          `Cannot complete forms: ${incompleteInstances
            .map(i => i.id)
            .join(', ')} are incomplete`,
          { status: 400 }
        )
      }
    }

    const updatedInstances = await db.formInstance.updateMany({
      where: { id: { in: instanceIds } },
      data: { status }
    })

    return NextResponse.json(updatedInstances)
  } catch (error) {
    console.error('Error updating form statuses:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 