import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { FormStatusOverview } from '@/components/forms/status/FormStatusOverview'
import { FormResponse } from '@/components/forms/FormResponse'

export default async function FormInstancePage({
  params,
}: {
  params: { instanceId: string }
}) {
  const instance = await db.formInstance.findUnique({
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