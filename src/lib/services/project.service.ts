import { ProjectType, ProjectStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Options for creating a new project
 */
export interface CreateProjectOptions {
  name: string;
  description?: string;
  projectType: ProjectType;
  customerName: string;
  vinNumber?: string;  // Required for VEHICLE_WRAP
  workflowId: string;
  managerId: string;
  startDate: Date;
  endDate?: Date;
}

/**
 * Validates project creation options based on project type
 * @param options - The project creation options to validate
 * @throws Error if validation fails
 */
function validateProjectOptions(options: CreateProjectOptions): void {
  if (options.projectType === ProjectType.VEHICLE_WRAP && !options.vinNumber) {
    throw new Error("VIN number is required for vehicle wrap projects");
  }

  if (!options.customerName.trim()) {
    throw new Error("Customer name is required");
  }

  if (!options.name.trim()) {
    throw new Error("Project name is required");
  }
}

/**
 * Creates a new project from a workflow template
 * @param options - The options for creating the project
 * @returns The created project with its phases and tasks
 */
export async function createProjectFromWorkflow(options: CreateProjectOptions) {
  // Validate options based on project type
  validateProjectOptions(options);

  // Verify manager exists
  const manager = await prisma.user.findUnique({
    where: { id: options.managerId }
  });

  if (!manager) {
    throw new Error("Invalid manager ID");
  }

  // Start a transaction to ensure all related records are created
  return await prisma.$transaction(async (tx) => {
    // 1. Create the project
    const project = await tx.project.create({
      data: {
        name: options.name,
        description: options.description,
        projectType: options.projectType,
        customerName: options.customerName,
        vinNumber: options.vinNumber,
        workflowId: options.workflowId,
        managerId: options.managerId,
        startDate: options.startDate,
        endDate: options.endDate,
        status: ProjectStatus.PLANNING,
      },
    });

    // 2. Get workflow phases and tasks
    const workflow = await tx.workflow.findUnique({
      where: { id: options.workflowId },
      include: {
        phases: {
          include: {
            tasks: true,
            formTemplates: {
              include: {
                completionRequirements: true,
              },
            },
          },
        },
      },
    });

    if (!workflow) {
      throw new Error("Workflow not found");
    }

    // 3. Create project phases with tasks and forms
    for (const phase of workflow.phases) {
      const projectPhase = await tx.projectPhase.create({
        data: {
          name: phase.name,
          description: phase.description,
          order: phase.order,
          projectId: project.id,
          phaseId: phase.id,
        },
      });

      // 4. Create project tasks
      for (const task of phase.tasks) {
        await tx.projectTask.create({
          data: {
            name: task.name,
            description: task.description,
            priority: task.priority,
            manHours: task.manHours,
            order: task.order,
            projectId: project.id,
            phaseId: projectPhase.id,
            workflowTaskId: task.id,
            departmentId: task.departmentId,
          },
        });
      }

      // 5. Create form instances based on completion requirements
      for (const formTemplate of phase.formTemplates) {
        const requirement = formTemplate.completionRequirements.find(
          (req) => req.phaseId === phase.id
        );

        if (requirement) {
          await tx.formInstance.create({
            data: {
              templateId: formTemplate.id,
              versionId: formTemplate.currentVersion.toString(),
              projectId: project.id,
              projectTaskId: project.id, // This needs to be associated with a specific task
              status: "ACTIVE",
            },
          });
        }
      }
    }

    // Return the created project with all its relations
    return await tx.project.findUnique({
      where: { id: project.id },
      include: {
        phases: {
          include: {
            tasks: true,
          },
        },
        formInstances: true,
      },
    });
  });
}

/**
 * Gets available workflows for a specific project type
 * @param projectType - The type of project to get workflows for
 * @returns List of available workflows
 */
export async function getWorkflowsForProjectType(projectType: ProjectType) {
  // For now, return all workflows
  // In the future, we can add a projectTypes field to workflows to filter them
  return await prisma.workflow.findMany({
    include: {
      phases: {
        include: {
          tasks: true,
        },
      },
    },
  });
} 