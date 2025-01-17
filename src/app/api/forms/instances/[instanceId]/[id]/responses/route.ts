import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { instanceId: string; id: string } }
) {
  try {
    const response = await db.formResponse.findUnique({
      where: {
        id: params.id,
        instanceId: params.instanceId
      },
      include: {
        instance: {
          include: {
            template: true
          }
        }
      }
    })

    if (!response) {
      return new NextResponse('Response not found', { status: 404 })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching form response:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { instanceId: string; id: string } }
) {
  try {
    const { data } = await request.json()

    const response = await db.formResponse.update({
      where: {
        id: params.id,
        instanceId: params.instanceId
      },
      data: { data }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating form response:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { instanceId: string; id: string } }
) {
  try {
    await db.formResponse.delete({
      where: {
        id: params.id,
        instanceId: params.instanceId
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting form response:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 