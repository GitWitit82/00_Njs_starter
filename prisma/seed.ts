import { PrismaClient, Role, Priority, ProjectStatus, Prisma } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

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