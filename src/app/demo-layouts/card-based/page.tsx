import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

/**
 * Card-Based Dashboard Layout Demo
 * Demonstrates a clean, modern interface with project cards
 */
export default function CardBasedLayout() {
  const projects = [
    {
      id: 1,
      name: "Fleet Vehicle Wrap",
      department: "Marketing",
      progress: 75,
      status: "In Progress",
      tasks: { completed: 15, total: 20 },
      description: "Complete fleet branding project for delivery vehicles",
    },
    {
      id: 2,
      name: "Custom Food Truck Wrap",
      department: "Design",
      progress: 30,
      status: "Design Phase",
      tasks: { completed: 3, total: 11 },
      description: "Full wrap design and installation for gourmet food truck",
    },
    {
      id: 3,
      name: "Race Car Sponsorship Wrap",
      department: "Production",
      progress: 90,
      status: "Final Review",
      tasks: { completed: 18, total: 20 },
      description: "High-performance wrap with sponsor logos for racing team",
    },
    {
      id: 4,
      name: "Commercial Van Wrap",
      department: "Prep",
      progress: 45,
      status: "Vehicle Prep",
      tasks: { completed: 8, total: 15 },
      description: "Full vehicle wrap for local HVAC company van fleet",
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Card-Based Dashboard Demo</h1>
        <p className="text-muted-foreground mt-2">
          A clean, modern interface that's easy to scan and mobile-friendly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <Badge variant={
                  project.status === "In Progress" ? "default" :
                  project.status === "Design Phase" ? "secondary" :
                  project.status === "Vehicle Prep" ? "warning" :
                  "success"
                }>{project.status}</Badge>
              </div>
              <CardDescription>
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Department</span>
                <span className="text-muted-foreground">
                  {project.department}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Tasks</span>
                <span className="text-muted-foreground">
                  {project.tasks.completed} / {project.tasks.total} completed
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 