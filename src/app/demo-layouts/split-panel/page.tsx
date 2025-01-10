"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ChevronRight, Clock, ListTodo } from "lucide-react"

/**
 * Split Panel Dashboard Layout Demo
 * Demonstrates a layout with project list and details side by side
 */
export default function SplitPanelLayout() {
  const [selectedProject, setSelectedProject] = useState(0)

  const projects = [
    {
      id: 1,
      name: "Fleet Vehicle Wrap",
      department: "Marketing",
      progress: 75,
      status: "In Progress",
      tasks: [
        { id: 1, name: "Creative Concept Meeting", status: "completed" },
        { id: 2, name: "Photos & Sizing", status: "completed" },
        { id: 3, name: "Physical Inspection", status: "completed" },
        { id: 4, name: "Pre-Design Layout Meeting", status: "in-progress" },
        { id: 5, name: "Create and verify Template", status: "in-progress" },
        { id: 6, name: "Start High Res Design", status: "pending" },
      ],
      timeline: "Est. 3 weeks remaining",
      description: "Complete fleet branding project for delivery vehicles. Includes full wrap design, production, and installation for a fleet of 5 delivery vans.",
    },
    {
      id: 2,
      name: "Custom Food Truck Wrap",
      department: "Design",
      progress: 30,
      status: "Design Phase",
      tasks: [
        { id: 1, name: "Pre-Design Layout Meeting", status: "completed" },
        { id: 2, name: "Create and verify Template", status: "completed" },
        { id: 3, name: "Start High Res Design", status: "in-progress" },
        { id: 4, name: "Art Direction Sign Off", status: "pending" },
        { id: 5, name: "Customer Sign Off", status: "pending" },
      ],
      timeline: "Est. 2 weeks remaining",
      description: "Full wrap design and installation for gourmet food truck. Custom design with menu integration and brand elements.",
    },
    {
      id: 3,
      name: "Race Car Sponsorship Wrap",
      department: "Production",
      progress: 90,
      status: "Final Review",
      tasks: [
        { id: 1, name: "Print Ready Files Review", status: "completed" },
        { id: 2, name: "Create Test Print", status: "completed" },
        { id: 3, name: "Printing", status: "completed" },
        { id: 4, name: "Lamination & QC", status: "completed" },
        { id: 5, name: "Final Installation QC", status: "in-progress" },
      ],
      timeline: "Est. 2 days remaining",
      description: "High-performance wrap with sponsor logos for racing team. Includes special materials for aerodynamic performance.",
    },
    {
      id: 4,
      name: "Commercial Van Wrap",
      department: "Prep",
      progress: 45,
      status: "Vehicle Prep",
      tasks: [
        { id: 1, name: "Intake of Item", status: "completed" },
        { id: 2, name: "Wrap Plan Set Up", status: "completed" },
        { id: 3, name: "Repairs & Vinyl Removal", status: "in-progress" },
        { id: 4, name: "Prep Clean", status: "pending" },
        { id: 5, name: "Surface Prep", status: "pending" },
      ],
      timeline: "Est. 1 week remaining",
      description: "Full vehicle wrap for local HVAC company van fleet. Includes surface preparation and vinyl removal from previous wrap.",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Split Panel Dashboard Demo</h1>
        <p className="text-muted-foreground mt-2">
          An efficient layout showing project list and details side by side.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Project List Panel */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Wrap Projects</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <CardContent className="space-y-4">
                {projects.map((project, index) => (
                  <div key={project.id}>
                    <Button
                      variant={selectedProject === index ? "secondary" : "ghost"}
                      className="w-full justify-between"
                      onClick={() => setSelectedProject(index)}
                    >
                      <span>{project.name}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    {index < projects.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>

        {/* Project Details Panel */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{projects[selectedProject].name}</CardTitle>
                <Badge variant={
                  projects[selectedProject].status === "In Progress" ? "default" :
                  projects[selectedProject].status === "Design Phase" ? "secondary" :
                  projects[selectedProject].status === "Vehicle Prep" ? "warning" :
                  "success"
                }>{projects[selectedProject].status}</Badge>
              </div>
              <p className="text-muted-foreground">
                Department: {projects[selectedProject].department}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{projects[selectedProject].progress}%</span>
                </div>
                <Progress value={projects[selectedProject].progress} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{projects[selectedProject].timeline}</span>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {projects[selectedProject].description}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <ListTodo className="h-4 w-4" />
                    Current Tasks
                  </h3>
                  <div className="space-y-2">
                    {projects[selectedProject].tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between">
                        <span>{task.name}</span>
                        <Badge variant={
                          task.status === "completed" ? "success" :
                          task.status === "in-progress" ? "default" :
                          "secondary"
                        }>
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 