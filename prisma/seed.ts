import { PrismaClient, Role, Priority, ProjectStatus, TaskStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

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
  const hashedPassword = await bcrypt.hash("1234", 10)
  const admin = await prisma.user.create({
    data: {
      name: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
      preferences: {
        create: {
          theme: "system",
        },
      },
    },
  })

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: "Engineering",
        description: "Software Development Team",
        color: "#2563eb", // Blue
      },
    }),
    prisma.department.create({
      data: {
        name: "Design",
        description: "UI/UX Design Team",
        color: "#db2777", // Pink
      },
    }),
    prisma.department.create({
      data: {
        name: "QA",
        description: "Quality Assurance Team",
        color: "#16a34a", // Green
      },
    }),
  ])

  // Create a sample workflow
  const workflow = await prisma.workflow.create({
    data: {
      name: "Software Development Lifecycle",
      description: "Standard workflow for software development projects",
      phases: {
        create: [
          {
            name: "Planning",
            description: "Project planning and requirement gathering",
            order: 1,
            tasks: {
              create: [
                {
                  name: "Requirements Gathering",
                  description: "Collect and document project requirements",
                  priority: Priority.HIGH,
                  manHours: 8,
                  order: 1,
                  departmentId: departments[0].id, // Engineering
                },
                {
                  name: "Project Planning",
                  description: "Create project timeline and resource allocation",
                  priority: Priority.HIGH,
                  manHours: 4,
                  order: 2,
                  departmentId: departments[0].id, // Engineering
                },
              ],
            },
          },
          {
            name: "Design",
            description: "UI/UX design phase",
            order: 2,
            tasks: {
              create: [
                {
                  name: "UI Design",
                  description: "Create user interface designs",
                  priority: Priority.HIGH,
                  manHours: 16,
                  order: 1,
                  departmentId: departments[1].id, // Design
                },
                {
                  name: "Design Review",
                  description: "Review and approve designs",
                  priority: Priority.MEDIUM,
                  manHours: 4,
                  order: 2,
                  departmentId: departments[1].id, // Design
                },
              ],
            },
          },
          {
            name: "Development",
            description: "Implementation phase",
            order: 3,
            tasks: {
              create: [
                {
                  name: "Frontend Development",
                  description: "Implement user interface",
                  priority: Priority.HIGH,
                  manHours: 40,
                  order: 1,
                  departmentId: departments[0].id, // Engineering
                },
                {
                  name: "Backend Development",
                  description: "Implement server-side functionality",
                  priority: Priority.HIGH,
                  manHours: 40,
                  order: 2,
                  departmentId: departments[0].id, // Engineering
                },
              ],
            },
          },
          {
            name: "Testing",
            description: "Quality assurance phase",
            order: 4,
            tasks: {
              create: [
                {
                  name: "Unit Testing",
                  description: "Execute unit tests",
                  priority: Priority.HIGH,
                  manHours: 16,
                  order: 1,
                  departmentId: departments[2].id, // QA
                },
                {
                  name: "Integration Testing",
                  description: "Execute integration tests",
                  priority: Priority.HIGH,
                  manHours: 16,
                  order: 2,
                  departmentId: departments[2].id, // QA
                },
              ],
            },
          },
        ],
      },
    },
  })

  // Create a sample project from the workflow
  const project = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Company website redesign project",
      status: ProjectStatus.PLANNING,
      startDate: new Date(),
      workflowId: workflow.id,
      managerId: admin.id,
    },
  })

  // Get all phases from the workflow
  const phases = await prisma.phase.findMany({
    where: { workflowId: workflow.id },
    include: { tasks: true },
  })

  // Create project phases and tasks from workflow phases
  for (const phase of phases) {
    const projectPhase = await prisma.projectPhase.create({
      data: {
        name: phase.name,
        description: phase.description,
        order: phase.order,
        projectId: project.id,
        phaseId: phase.id,
      },
    })

    // Create project tasks from workflow tasks
    for (const task of phase.tasks) {
      await prisma.projectTask.create({
        data: {
          name: task.name,
          description: task.description,
          priority: task.priority,
          manHours: task.manHours,
          order: task.order,
          projectPhaseId: projectPhase.id,
          departmentId: task.departmentId,
          workflowTaskId: task.id,
          assignedToId: admin.id,
        },
      })
    }
  }

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