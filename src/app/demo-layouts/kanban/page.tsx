"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock } from "lucide-react"

interface Task {
  id: number
  title: string
  description: string
  dueDate: string
  assignee: {
    name: string
    avatar: string
    initials: string
  }
  priority: "low" | "medium" | "high"
}

interface Column {
  id: string
  title: string
  tasks: Task[]
}

/**
 * Kanban Board Layout Demo
 * Demonstrates a drag-and-drop task management interface for vehicle wrap workflow
 */
export default function KanbanLayout() {
  const [columns] = useState<Column[]>([
    {
      id: "todo",
      title: "To Do",
      tasks: [
        {
          id: 1,
          title: "Pre-Design Layout Meeting",
          description: "Review vehicle measurements and discuss design constraints",
          dueDate: "2024-02-15",
          assignee: {
            name: "Sarah Chen",
            avatar: "/avatars/sarah.jpg",
            initials: "SC"
          },
          priority: "high"
        },
        {
          id: 2,
          title: "Create Vehicle Template",
          description: "Download and verify template from TheBadWrap.com",
          dueDate: "2024-02-20",
          assignee: {
            name: "Mike Johnson",
            avatar: "/avatars/mike.jpg",
            initials: "MJ"
          },
          priority: "high"
        },
        {
          id: 3,
          title: "Start High Res Design",
          description: "Create high resolution design with locked horizon line",
          dueDate: "2024-02-22",
          assignee: {
            name: "Emily Wong",
            avatar: "/avatars/emily.jpg",
            initials: "EW"
          },
          priority: "high"
        }
      ]
    },
    {
      id: "in-progress",
      title: "In Progress",
      tasks: [
        {
          id: 4,
          title: "Print Ready Files Review",
          description: "Review blueprints and prepare files for production",
          dueDate: "2024-02-10",
          assignee: {
            name: "Tom Smith",
            avatar: "/avatars/tom.jpg",
            initials: "TS"
          },
          priority: "high"
        },
        {
          id: 5,
          title: "Vehicle Prep",
          description: "Surface preparation and vinyl removal",
          dueDate: "2024-02-12",
          assignee: {
            name: "David Lee",
            avatar: "/avatars/david.jpg",
            initials: "DL"
          },
          priority: "medium"
        }
      ]
    },
    {
      id: "review",
      title: "Review",
      tasks: [
        {
          id: 6,
          title: "Customer Sign Off",
          description: "Get final approval on wrap design",
          dueDate: "2024-02-08",
          assignee: {
            name: "Alex Turner",
            avatar: "/avatars/alex.jpg",
            initials: "AT"
          },
          priority: "high"
        },
        {
          id: 7,
          title: "Print Test Review",
          description: "Review test prints for color accuracy",
          dueDate: "2024-02-09",
          assignee: {
            name: "Lisa Park",
            avatar: "/avatars/lisa.jpg",
            initials: "LP"
          },
          priority: "high"
        }
      ]
    },
    {
      id: "done",
      title: "Done",
      tasks: [
        {
          id: 8,
          title: "Creative Concept Meeting",
          description: "Initial meeting to discuss design concepts",
          dueDate: "2024-02-05",
          assignee: {
            name: "Rachel Kim",
            avatar: "/avatars/rachel.jpg",
            initials: "RK"
          },
          priority: "medium"
        },
        {
          id: 9,
          title: "Photos & Sizing",
          description: "Complete vehicle measurements and photos",
          dueDate: "2024-02-06",
          assignee: {
            name: "James Wilson",
            avatar: "/avatars/james.jpg",
            initials: "JW"
          },
          priority: "high"
        },
        {
          id: 10,
          title: "Physical Inspection",
          description: "Inspect vehicle condition and document requirements",
          dueDate: "2024-02-07",
          assignee: {
            name: "Emma Davis",
            avatar: "/avatars/emma.jpg",
            initials: "ED"
          },
          priority: "high"
        }
      ]
    }
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kanban Board Demo</h1>
        <p className="text-muted-foreground mt-2">
          A visual task management interface with drag-and-drop functionality (coming soon).
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="flex gap-6 p-6">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {column.title}
                    <Badge variant="secondary" className="ml-2">
                      {column.tasks.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {column.tasks.map((task) => (
                    <Card key={task.id} className="cursor-move hover:shadow-md transition-shadow">
                      <CardContent className="p-4 space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{task.title}</h3>
                            <Badge variant={
                              task.priority === "high" ? "destructive" :
                              task.priority === "medium" ? "default" :
                              "secondary"
                            }>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={task.assignee.avatar} />
                              <AvatarFallback>{task.assignee.initials}</AvatarFallback>
                            </Avatar>
                            <span className="text-muted-foreground">
                              {task.assignee.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{task.dueDate}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 