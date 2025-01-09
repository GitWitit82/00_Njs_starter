import { db } from "@/lib/db"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

/**
 * Form instances list with batch operations
 */
export default async function FormInstances() {
  const instances = await db.formInstance.findMany({
    include: {
      template: {
        include: {
          department: true,
          workflow: true,
          phase: true,
        },
      },
      project: true,
      responses: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500"
      case "IN_PROGRESS":
        return "bg-blue-500"
      case "PENDING_REVIEW":
        return "bg-yellow-500"
      case "COMPLETED":
        return "bg-purple-500"
      case "ARCHIVED":
        return "bg-gray-500"
      case "ON_HOLD":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Form Instances</h2>
          <Button variant="outline">Batch Update</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Form Name</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Phase</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instances.map((instance) => (
              <TableRow key={instance.id}>
                <TableCell>
                  <Link
                    href={`/forms/instances/${instance.id}`}
                    className="hover:underline"
                  >
                    {instance.template.name}
                  </Link>
                </TableCell>
                <TableCell>{instance.project?.name || "N/A"}</TableCell>
                <TableCell>
                  {instance.template.department?.name || "N/A"}
                </TableCell>
                <TableCell>{instance.template.phase?.name || "N/A"}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(instance.status)} text-white`}
                  >
                    {instance.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(instance.updatedAt, { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Link href={`/forms/instances/${instance.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
} 