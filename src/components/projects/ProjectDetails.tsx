import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Clock, FileText } from "lucide-react"

interface ProjectDetailsProps {
  project: any // Replace with proper type
}

/**
 * Detailed project view component
 * Shows project phases, tasks, and associated forms
 */
export function ProjectDetails({ project }: ProjectDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{project?.name || "Project Name"}</h1>
          <p className="text-muted-foreground">{project?.description || "Project description"}</p>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-right">
            <span className="font-medium">Department:</span> Marketing
          </div>
          <div className="text-sm text-right">
            <span className="font-medium">Start Date:</span> Jan 10, 2024
          </div>
        </div>
      </div>

      {/* Project Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>Overall completion and phase status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>45%</span>
              </div>
              <Progress value={45} />
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <div className="font-medium">Marketing</div>
                <div className="text-green-600">Completed</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">Design</div>
                <div className="text-blue-600">In Progress</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">Production</div>
                <div className="text-gray-400">Not Started</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">Installation</div>
                <div className="text-gray-400">Not Started</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Tasks and Forms */}
      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <div className="grid gap-4">
            {/* Marketing Phase */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Marketing Phase</CardTitle>
                <CardDescription>Completed on Jan 8, 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">Initial Client Meeting</div>
                      <div className="text-sm text-muted-foreground">Completed by John Doe</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">Project Requirements</div>
                      <div className="text-sm text-muted-foreground">Completed by Jane Smith</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design Phase */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Design Phase</CardTitle>
                <CardDescription>In Progress - Due Jan 15, 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">Initial Designs</div>
                      <div className="text-sm text-muted-foreground">Completed by Design Team</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Clock className="text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">Client Review</div>
                      <div className="text-sm text-muted-foreground">In Progress</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Circle className="text-gray-300" />
                    <div className="flex-1">
                      <div className="font-medium">Final Approval</div>
                      <div className="text-sm text-muted-foreground">Not Started</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Required Forms</CardTitle>
                <CardDescription>Forms that need to be completed for this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <FileText className="text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">Project Initiation Form</div>
                      <div className="text-sm text-muted-foreground">Completed on Jan 5, 2024</div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <FileText className="text-amber-600" />
                    <div className="flex-1">
                      <div className="font-medium">Design Review Form</div>
                      <div className="text-sm text-muted-foreground">Due Jan 12, 2024</div>
                    </div>
                    <Button variant="outline" size="sm">Fill Out</Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <FileText className="text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium">Quality Check Form</div>
                      <div className="text-sm text-muted-foreground">Not yet available</div>
                    </div>
                    <Button variant="outline" size="sm" disabled>View</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 