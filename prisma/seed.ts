import { PrismaClient, Role, Priority, ProjectStatus, Prisma } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function seedFormStatusTracking() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  })

  if (!admin) throw new Error("Admin user not found")

  // Create a test workflow for forms
  const formWorkflow = await prisma.workflow.create({
    data: {
      name: "Form Testing Workflow",
      description: "Workflow for testing form dependencies and status tracking"
    }
  })

  // Create phases for the workflow
  const phases = await Promise.all([
    prisma.phase.create({
      data: {
        name: "Initial Review",
        description: "First phase of form review",
        order: 1,
        workflowId: formWorkflow.id
      }
    }),
    prisma.phase.create({
      data: {
        name: "Detailed Assessment",
        description: "Detailed form assessment phase",
        order: 2,
        workflowId: formWorkflow.id
      }
    }),
    prisma.phase.create({
      data: {
        name: "Final Approval",
        description: "Final approval phase",
        order: 3,
        workflowId: formWorkflow.id
      }
    })
  ])

  // Create a series of dependent form templates
  const formTemplates = await Promise.all([
    // Initial Assessment Form
    prisma.formTemplate.create({
      data: {
        name: "Initial Assessment Form",
        description: "Must be completed first",
        type: "FORM",
        workflowId: formWorkflow.id,
        phaseId: phases[0].id,
        schema: { sections: [] },
        priority: "CRITICAL"
      }
    }),
    // Detailed Review Form
    prisma.formTemplate.create({
      data: {
        name: "Detailed Review Form",
        description: "Depends on Initial Assessment",
        type: "FORM",
        workflowId: formWorkflow.id,
        phaseId: phases[1].id,
        schema: { sections: [] },
        priority: "STANDARD"
      }
    }),
    // Final Approval Form
    prisma.formTemplate.create({
      data: {
        name: "Final Approval Form",
        description: "Requires all previous forms to be completed",
        type: "FORM",
        workflowId: formWorkflow.id,
        phaseId: phases[2].id,
        schema: { sections: [] },
        priority: "CRITICAL"
      }
    })
  ])

  // Create completion requirements with dependencies
  const requirements = await Promise.all([
    // Initial Assessment Requirement
    prisma.formCompletionRequirement.create({
      data: {
        templateId: formTemplates[0].id,
        phaseId: phases[0].id,
        isRequired: true,
        requiredForPhase: true,
        requiredForTask: true,
        completionOrder: 1
      }
    }),
    // Detailed Review Requirement
    prisma.formCompletionRequirement.create({
      data: {
        templateId: formTemplates[1].id,
        phaseId: phases[1].id,
        isRequired: true,
        requiredForPhase: true,
        requiredForTask: true,
        completionOrder: 2,
        dependsOn: {
          connect: { id: formTemplates[0].id }
        }
      }
    }),
    // Final Approval Requirement
    prisma.formCompletionRequirement.create({
      data: {
        templateId: formTemplates[2].id,
        phaseId: phases[2].id,
        isRequired: true,
        requiredForPhase: true,
        requiredForTask: true,
        completionOrder: 3,
        dependsOn: {
          connect: [
            { id: formTemplates[0].id },
            { id: formTemplates[1].id }
          ]
        }
      }
    })
  ])

  // Create a test project
  const project = await prisma.project.create({
    data: {
      name: "Form Testing Project",
      description: "Project for testing form status tracking",
      status: "PLANNING",
      startDate: new Date(),
      workflowId: formWorkflow.id,
      managerId: admin.id
    }
  })

  // Create form instances for the project
  const instances = await Promise.all(
    formTemplates.map(template =>
      prisma.formInstance.create({
        data: {
          templateId: template.id,
          versionId: "1", // Assuming version 1
          projectId: project.id,
          projectTaskId: "task1", // You'll need to create actual tasks
          status: "ACTIVE"
        }
      })
    )
  )

  // Create status history for the first instance
  const statusHistory = [
    {
      status: "ACTIVE",
      comments: "Form instance created",
      metadata: { initialCreation: true }
    },
    {
      status: "IN_PROGRESS",
      comments: "Started working on form",
      metadata: { startedBy: admin.id }
    },
    {
      status: "ON_HOLD",
      comments: "Waiting for additional information",
      metadata: { reason: "Missing client input" }
    },
    {
      status: "IN_PROGRESS",
      comments: "Resumed work after receiving information",
      metadata: { resumedBy: admin.id }
    },
    {
      status: "PENDING_REVIEW",
      comments: "Ready for review",
      metadata: { completionPercentage: 100 }
    },
    {
      status: "COMPLETED",
      comments: "Form approved and completed",
      metadata: { approvedBy: admin.id }
    }
  ]

  // Create status history entries with delays
  for (const status of statusHistory) {
    await prisma.formStatusHistory.create({
      data: {
        instanceId: instances[0].id,
        status: status.status as any,
        changedById: admin.id,
        comments: status.comments,
        metadata: status.metadata,
        changedAt: new Date()
      }
    })

    // Update the instance status
    await prisma.formInstance.update({
      where: { id: instances[0].id },
      data: { status: status.status as any }
    })

    // Add a small delay between status changes
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log("Form status tracking seed data created successfully")
}

async function main() {
  // Clean up existing data
  await prisma.userPreference.deleteMany()
  await prisma.projectTask.deleteMany()
  await prisma.projectPhase.deleteMany()
  await prisma.project.deleteMany()
  await prisma.workflowTask.deleteMany()
  await prisma.phase.deleteMany()
  await prisma.workflow.deleteMany()
  await prisma.department.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  const hashedPassword = await hash("1234", 12)
  const admin = await prisma.user.create({
    data: {
      name: "admin",
      email: "admin@example.com",
      role: Role.ADMIN,
      hashedPassword: hashedPassword,
    } as Prisma.UserUncheckedCreateInput,
  })

  // Create departments
  const engineering = await prisma.department.create({
    data: {
      name: "Engineering",
      description: "Software development team",
      color: "#2563eb", // blue-600
    },
  })

  const design = await prisma.department.create({
    data: {
      name: "Design",
      description: "UI/UX design team",
      color: "#db2777", // pink-600
    },
  })

  const qa = await prisma.department.create({
    data: {
      name: "QA",
      description: "Quality assurance team",
      color: "#16a34a", // green-600
    },
  })

  // Create workflow
  const workflow = await prisma.workflow.create({
    data: {
      name: "Software Development Lifecycle",
      description: "Standard workflow for software projects",
    },
  })

  // Create phases
  const phases = await Promise.all([
    prisma.phase.create({
      data: {
        name: "Planning",
        description: "Project planning and requirements gathering",
        order: 1,
        workflowId: workflow.id,
      },
    }),
    prisma.phase.create({
      data: {
        name: "Design",
        description: "UI/UX design and architecture",
        order: 2,
        workflowId: workflow.id,
      },
    }),
    prisma.phase.create({
      data: {
        name: "Development",
        description: "Implementation and coding",
        order: 3,
        workflowId: workflow.id,
      },
    }),
    prisma.phase.create({
      data: {
        name: "Testing",
        description: "Quality assurance and testing",
        order: 4,
        workflowId: workflow.id,
      },
    }),
  ])

  // Create tasks for each phase
  for (const [index, phase] of phases.entries()) {
    const tasks = [
      {
        name: "Requirements Analysis",
        description: "Gather and analyze project requirements",
        priority: Priority.HIGH,
        manHours: 8,
        order: 1,
        departmentId: engineering.id,
      },
      {
        name: "Technical Design",
        description: "Create technical design documents",
        priority: Priority.HIGH,
        manHours: 16,
        order: 2,
        departmentId: engineering.id,
      },
      {
        name: "Implementation",
        description: "Code development and implementation",
        priority: Priority.MEDIUM,
        manHours: 40,
        order: 3,
        departmentId: engineering.id,
      },
    ]

    await Promise.all(
      tasks.map((task) =>
        prisma.workflowTask.create({
          data: {
            ...task,
            phaseId: phase.id,
          },
        })
      )
    )
  }

  // Create a sample project
  const project = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Redesign company website with modern UI",
      status: ProjectStatus.PLANNING,
      startDate: new Date(),
      workflowId: workflow.id,
      managerId: admin.id,
    } as Prisma.ProjectUncheckedCreateInput,
  })

  // Create project phases
  const projectPhases = await Promise.all(
    phases.map((phase) =>
      prisma.projectPhase.create({
        data: {
          name: phase.name,
          description: phase.description,
          order: phase.order,
          projectId: project.id,
          phaseId: phase.id,
        },
      })
    )
  )

  // Create project tasks
  const workflowTasks = await prisma.workflowTask.findMany({
    where: {
      phaseId: phases[0].id,
    },
  })

  await Promise.all(
    workflowTasks.map((task, index) =>
      prisma.projectTask.create({
        data: {
          name: task.name,
          description: task.description,
          priority: task.priority,
          manHours: task.manHours,
          order: index + 1,
          projectPhaseId: projectPhases[0].id,
          departmentId: task.departmentId,
          workflowTaskId: task.id,
          assignedToId: admin.id,
        },
      })
    )
  )

  // Seed form status tracking data
  await seedFormStatusTracking()

  console.log("Seed data created successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 