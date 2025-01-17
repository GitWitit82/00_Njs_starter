import { Metadata } from "next"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Kanban Layout",
  description: "A kanban board layout example",
}

export default function KanbanLayout() {
  const columns = [
    {
      id: "todo",
      title: "To Do",
      tasks: [
        {
          id: 1,
          title: "Research competitors",
          priority: "low",
        },
        {
          id: 2,
          title: "Design mockups",
          priority: "medium",
        },
      ],
    },
    {
      id: "in-progress",
      title: "In Progress",
      tasks: [
        {
          id: 3,
          title: "Implement authentication",
          priority: "high",
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      tasks: [
        {
          id: 4,
          title: "Setup project structure",
          priority: "medium",
        },
        {
          id: 5,
          title: "Create database schema",
          priority: "high",
        },
      ],
    },
  ]

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">Kanban Board</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <h2 className="text-xl font-semibold">{column.title}</h2>
            <div className="space-y-4">
              {column.tasks.map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{task.title}</h3>
                    <Badge
                      variant={
                        task.priority === "high"
                          ? "destructive"
                          : task.priority === "medium"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 