import { ProjectDetails } from "@/components/projects/ProjectDetails"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

interface ProjectPageProps {
  params: {
    id: string
  }
}

/**
 * Dynamic project page component
 * Shows detailed view of a specific project
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  // TODO: Fetch project data using params.id
  const project = {
    id: params.id,
    name: "Project Alpha",
    description: "Marketing Campaign Q1 2024",
    department: "Marketing",
    startDate: "2024-01-10",
    // Add more project data as needed
  }

  return (
    <div className="container mx-auto p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>

      {/* Project Details */}
      <ProjectDetails project={project} />
    </div>
  )
} 