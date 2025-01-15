/**
 * @file ProjectsTable.tsx
 * @description Table component for displaying projects
 */

import { format } from "date-fns";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface Project {
  id: string;
  name: string;
  description: string | null;
  projectType: "VEHICLE_WRAP" | "SIGN" | "MURAL";
  customerName: string;
  status: string;
  startDate: Date;
  endDate: Date | null;
  workflow: {
    name: string;
  };
  manager: {
    name: string | null;
  };
  phases: Array<{
    tasks: Array<{
      status: string;
    }>;
  }>;
}

interface ProjectsTableProps {
  projects: Project[];
}

/**
 * Calculates the completion percentage of a project
 */
function calculateProgress(project: Project): number {
  const totalTasks = project.phases.reduce(
    (acc, phase) => acc + phase.tasks.length,
    0
  );
  
  if (totalTasks === 0) return 0;

  const completedTasks = project.phases.reduce(
    (acc, phase) =>
      acc +
      phase.tasks.filter((task) => task.status === "COMPLETED").length,
    0
  );

  return Math.round((completedTasks / totalTasks) * 100);
}

/**
 * Gets the appropriate badge variant based on project status
 */
function getStatusVariant(status: string) {
  switch (status) {
    case "PLANNING":
      return "secondary";
    case "IN_PROGRESS":
      return "default";
    case "ON_HOLD":
      return "warning";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "destructive";
    default:
      return "secondary";
  }
}

/**
 * Gets the display text for project type
 */
function getProjectTypeDisplay(type: "VEHICLE_WRAP" | "SIGN" | "MURAL") {
  switch (type) {
    case "VEHICLE_WRAP":
      return "Vehicle Wrap";
    case "SIGN":
      return "Sign";
    case "MURAL":
      return "Mural";
    default:
      return type;
  }
}

/**
 * Table component for displaying projects
 */
export function ProjectsTable({ projects }: ProjectsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{project.name}</div>
                  {project.description && (
                    <div className="text-sm text-muted-foreground">
                      {project.description}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    {project.workflow.name}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getProjectTypeDisplay(project.projectType)}
              </TableCell>
              <TableCell>{project.customerName}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(project.status)}>
                  {project.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="w-[100px]">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      {calculateProgress(project)}%
                    </span>
                  </div>
                  <Progress value={calculateProgress(project)} />
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(project.startDate), "MMM d, yyyy")}
              </TableCell>
              <TableCell>{project.manager.name}</TableCell>
              <TableCell className="text-right">
                <Link href={`/projects/${project.id}`}>
                  <Button variant="ghost" size="icon">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="sr-only">View project</span>
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 