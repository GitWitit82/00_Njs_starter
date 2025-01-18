import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FormStatusOverview } from '@/components/forms/status/FormStatusOverview'
import { FormResponse } from '@/components/forms/FormResponse'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = {
  params: { instanceId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Form Instance ${params.instanceId}`,
  }
}

export default async function FormInstancePage({ params }: Props) {
  const instance = await prisma.formInstance.findUnique({
    where: { id: params.instanceId },
    include: {
      template: true,
      responses: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!instance) {
    notFound()
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{instance.template.name}</h1>
          {instance.template.description && (
            <p className="text-muted-foreground mt-1">
              {instance.template.description}
            </p>
          )}
        </div>
        <FormStatusOverview instance={instance} />
      </div>

      <FormResponse
        instance={instance}
        response={instance.responses[0]}
        isReadOnly={instance.status === 'COMPLETED'}
      />
    </div>
  )
} 