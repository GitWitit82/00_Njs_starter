import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Plus, ChevronRight } from "lucide-react"
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog"
import Link from "next/link"

/**
 * Projects dashboard page component
 * Displays projects in a card-based layout with status and progress
 */
export default function ProjectsPage() {
  return (
    <div className="container mx-auto p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and workflows</p>
        </div>
        <CreateProjectDialog 
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          }
        />
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Project Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Project Alpha
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
            </CardTitle>
            <CardDescription>Marketing Campaign Q1 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Section */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>45%</span>
                </div>
                <Progress value={45} />
              </div>
              
              {/* Workflow Status */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Current Phase</h4>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  Design Phase (2/5 tasks completed)
                </div>
              </div>

              {/* Forms Status */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Required Forms</h4>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Design Review Form</span>
                    <span className="text-amber-600">Pending</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quality Check Form</span>
                    <span className="text-green-600">Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/projects/1" className="w-full">
              <Button variant="ghost" className="w-full">
                View Details
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* New Project Card */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>Start a new project with workflow and forms</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CreateProjectDialog
              trigger={
                <Button variant="outline" size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 