import { PrismaClient, Role, Priority, ProjectStatus, Prisma } from "@prisma/client"
import { hash } from "bcryptjs"
import crypto from "crypto"

const prisma = new PrismaClient()

const PROJECT_TYPES = {
  VEHICLE_WRAP: "VEHICLE_WRAP",
  SIGN: "SIGN",
  MURAL: "MURAL",
} as const;

type ProjectType = typeof PROJECT_TYPES[keyof typeof PROJECT_TYPES];

// TypeScript interfaces for workflow data structure
interface WorkflowTask {
  name: string
  description: string
  order: number
  priority: Priority
  manHours: number
}

interface WorkflowPhase {
  name: string
  description: string
  order: number
  tasks: WorkflowTask[]
}

interface WorkflowData {
  name: string
  description: string
  phases: WorkflowPhase[]
}

// Type for department mapping
type DepartmentMapping = {
  [key: string]: string | undefined
}

// Project seed data type
interface ProjectSeedData {
  name: string
  description: string
  projectType: ProjectType
  customerName: string
  vinNumber?: string
  workflowId: string
  managerId: string
  startDate: Date
  endDate: Date
  status: ProjectStatus
}

// Department seed data
const departmentData = [
  {
    name: 'Marketing',
    description: 'Handles creative concepts and marketing strategies',
    color: '#2563eb'
  },
  {
    name: 'Project Mgmt',
    description: 'Manages project workflow and client communication',
    color: '#16a34a'
  },
  {
    name: 'Design',
    description: 'Creates designs and handles artwork production',
    color: '#9333ea'
  },
  {
    name: 'All Departments',
    description: 'Tasks that require collaboration across departments',
    color: '#dc2626'
  },
  {
    name: 'Finance',
    description: 'Handles invoicing and financial tracking',
    color: '#ca8a04'
  },
  {
    name: 'Installation',
    description: 'Performs physical installation of products',
    color: '#0891b2'
  },
  {
    name: 'Production',
    description: 'Handles manufacturing and production processes',
    color: '#be185d'
  },
  {
    name: 'Prep',
    description: 'Prepares surfaces and materials for installation',
    color: '#ea580c'
  }
]

// Workflow data
const workflowData: WorkflowData = {
  name: "Vehicle Wrap Workflow",
  description: "Standard workflow for vehicle wrap projects",
  phases: [
    {
      name: "Marketing",
      description: "Initial marketing and concept phase",
      order: 1,
      tasks: [
        { name: 'Creative Concept Meeting', description: 'Marketing', order: 1, priority: Priority.MEDIUM, manHours: 2 },
        { name: 'Follow up Email', description: 'Marketing', order: 2, priority: Priority.MEDIUM, manHours: 1 },
        { name: 'Rough Mock up', description: 'Marketing', order: 3, priority: Priority.HIGH, manHours: 4 },
        { name: 'Photos & Sizing', description: 'Marketing', order: 4, priority: Priority.HIGH, manHours: 2 },
        { name: 'Physical Inspection', description: 'Marketing', order: 5, priority: Priority.HIGH, manHours: 2 },
        { name: '$$$ Confirm and Update Invoice', description: 'Marketing', order: 6, priority: Priority.HIGH, manHours: 1 }
      ]
    },
    {
      name: "Design",
      description: "Design and approval phase",
      order: 2,
      tasks: [
        { name: 'Pre-Design Layout Meeting', description: 'Graphic Design', order: 7, priority: Priority.HIGH, manHours: 2 },
        { name: 'Create and verify Template', description: 'Graphic Design', order: 8, priority: Priority.HIGH, manHours: 4 },
        { name: 'Start High Res Design', description: 'Graphic Design', order: 9, priority: Priority.HIGH, manHours: 8 },
        { name: 'Art Direction Sign Off', description: 'Graphic Design', order: 10, priority: Priority.HIGH, manHours: 2 },
        { name: 'Customer Sign Off', description: 'Graphic Design', order: 11, priority: Priority.HIGH, manHours: 2 },
        { name: 'Final Design', description: 'Graphic Design', order: 12, priority: Priority.HIGH, manHours: 4 },
        { name: 'Internal Proof', description: 'Graphic Design', order: 13, priority: Priority.HIGH, manHours: 2 },
        { name: 'Art Direction Sign Off', description: 'Graphic Design', order: 14, priority: Priority.HIGH, manHours: 2 },
        { name: 'Customer Sign Off', description: 'Graphic Design', order: 15, priority: Priority.HIGH, manHours: 2 },
        { name: '$$$ Confirm Customer Deposit', description: 'Graphic Design', order: 16, priority: Priority.HIGH, manHours: 1 },
        { name: 'Firm Hold Schedule Installation Drop Off', description: 'Graphic Design', order: 17, priority: Priority.HIGH, manHours: 1 }
      ]
    },
    {
      name: "Production",
      description: "Production and materials phase",
      order: 3,
      tasks: [
        { name: 'Order Raw Materials', description: 'Production process', order: 18, priority: Priority.HIGH, manHours: 2 },
        { name: 'Make Installer Sheet', description: 'Production process', order: 19, priority: Priority.MEDIUM, manHours: 2 },
        { name: 'Print Ready Files Blue Prints and Review', description: 'Production process', order: 20, priority: Priority.HIGH, manHours: 4 },
        { name: 'Create Test Print', description: 'Production process', order: 21, priority: Priority.HIGH, manHours: 2 },
        { name: 'Pre Install Meeting', description: 'Production process', order: 22, priority: Priority.HIGH, manHours: 2 },
        { name: 'Paneling', description: 'Production process', order: 23, priority: Priority.MEDIUM, manHours: 4 },
        { name: 'Printing', description: 'Production process', order: 24, priority: Priority.HIGH, manHours: 6 },
        { name: 'Lamination & Rough QC', description: 'Production process', order: 25, priority: Priority.HIGH, manHours: 4 },
        { name: 'Trim & Sew', description: 'Production process', order: 26, priority: Priority.MEDIUM, manHours: 4 },
        { name: 'Plot', description: 'Production process', order: 27, priority: Priority.MEDIUM, manHours: 2 },
        { name: 'Project Inventory Control / QC', description: 'Production process', order: 28, priority: Priority.HIGH, manHours: 2 }
      ]
    },
    {
      name: "Prep",
      description: "Vehicle preparation phase",
      order: 4,
      tasks: [
        { name: 'Intake of Item', description: 'Installation prep', order: 29, priority: Priority.HIGH, manHours: 1 },
        { name: 'Wrap Plan Set Up', description: 'Installation prep', order: 30, priority: Priority.HIGH, manHours: 2 },
        { name: 'Repairs & Vinyl Adhesive Removal', description: 'Installation prep', order: 31, priority: Priority.HIGH, manHours: 4 },
        { name: 'Prep Clean', description: 'Installation prep', order: 32, priority: Priority.HIGH, manHours: 2 }
      ]
    },
    {
      name: "Body Work",
      description: "Vehicle body work phase",
      order: 5,
      tasks: [
        { name: 'Putty', description: 'Body work process', order: 33, priority: Priority.MEDIUM, manHours: 2 },
        { name: 'Bondo', description: 'Body work process', order: 34, priority: Priority.MEDIUM, manHours: 3 },
        { name: 'Dent Removal', description: 'Body work process', order: 35, priority: Priority.HIGH, manHours: 4 },
        { name: 'Fabrication', description: 'Body work process', order: 36, priority: Priority.HIGH, manHours: 6 }
      ]
    },
    {
      name: "Paint",
      description: "Vehicle painting phase",
      order: 6,
      tasks: [
        { name: 'Surface Prep / Degrease', description: 'Paint process', order: 37, priority: Priority.HIGH, manHours: 2 },
        { name: 'Masking', description: 'Paint process', order: 38, priority: Priority.MEDIUM, manHours: 2 },
        { name: 'Primer', description: 'Paint process', order: 39, priority: Priority.HIGH, manHours: 2 },
        { name: 'Paint', description: 'Paint process', order: 40, priority: Priority.HIGH, manHours: 4 },
        { name: 'Specialty Paint/ Texture/ Bedliner', description: 'Paint process', order: 41, priority: Priority.HIGH, manHours: 4 },
        { name: 'Removal of Masking', description: 'Paint process', order: 42, priority: Priority.MEDIUM, manHours: 1 }
      ]
    }
  ]
}

// Sample projects data
const projectsData: ProjectSeedData[] = [
  {
    name: "Ford F150 Full Wrap",
    description: "Full vehicle wrap for Ford F150",
    projectType: PROJECT_TYPES.VEHICLE_WRAP,
    customerName: "John Smith",
    vinNumber: "1FTEW1EG5JFB53281",
    workflowId: "vehicle-wrap-workflow", // This will be replaced with actual ID
    managerId: "admin-user", // This will be replaced with actual ID
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: ProjectStatus.PLANNING
  },
  {
    name: "Store Front Sign",
    description: "LED-lit storefront sign for ABC Company",
    projectType: PROJECT_TYPES.SIGN,
    customerName: "ABC Company",
    workflowId: "sign-workflow", // This will be replaced with actual ID
    managerId: "admin-user", // This will be replaced with actual ID
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    status: ProjectStatus.PLANNING
  },
  {
    name: "City Park Mural",
    description: "Large-scale mural for city park",
    projectType: PROJECT_TYPES.MURAL,
    customerName: "City Parks Department",
    workflowId: "mural-workflow", // This will be replaced with actual ID
    managerId: "admin-user", // This will be replaced with actual ID
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: ProjectStatus.PLANNING
  }
];

async function main() {
  // Clean up existing data in the correct order
  try {
    // Delete all data in reverse order of dependencies
    await prisma.formStatusHistory.deleteMany()
    await prisma.formResponse.deleteMany()
    await prisma.formInstance.deleteMany()
    await prisma.formVersion.deleteMany()
    await prisma.formCompletionRequirement.deleteMany()
    await prisma.formTemplate.deleteMany()
  await prisma.userPreference.deleteMany()
  await prisma.projectTask.deleteMany()
  await prisma.projectPhase.deleteMany()
  await prisma.project.deleteMany()
  await prisma.workflowTask.deleteMany()
  await prisma.phase.deleteMany()
  await prisma.workflow.deleteMany()
  await prisma.department.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
  await prisma.user.deleteMany()

    // Create admin user with upsert to handle potential duplicates
    const hashedPassword = await hash("1234", 12)
    const adminUser = await prisma.user.upsert({
      where: {
        email: "admin@example.com"
      },
      update: {
        name: "admin",
        hashedPassword,
        role: "ADMIN"
      },
      create: {
        name: "admin",
        email: "admin@example.com",
        hashedPassword,
        role: "ADMIN"
      }
    })

  // Create departments
    const departments = await Promise.all(
      departmentData.map(dept =>
        prisma.department.create({
          data: dept
        })
      )
    )

    // Create department mapping for easy lookup
    const departmentMapping: DepartmentMapping = departments.reduce((acc, dept) => ({
      ...acc,
      [dept.name]: dept.id
    }), {})

  // Create workflow
  const workflow = await prisma.workflow.create({
    data: {
        name: workflowData.name,
        description: workflowData.description,
      },
    })

    // Create phases and tasks
    for (const phaseData of workflowData.phases) {
      const phase = await prisma.phase.create({
      data: {
          name: phaseData.name,
          description: phaseData.description,
          order: phaseData.order,
        workflowId: workflow.id,
      },
      })

      // Create tasks for the phase
    await Promise.all(
        phaseData.tasks.map(taskData =>
        prisma.workflowTask.create({
          data: {
              name: taskData.name,
              description: taskData.description,
              order: taskData.order,
              priority: taskData.priority,
              manHours: taskData.manHours,
            phaseId: phase.id,
          },
        })
      )
    )
  }

    // Create checklist templates
    await seedChecklistTemplates()

    // Create sample projects
    for (const projectData of projectsData) {
      const workflow = await prisma.workflow.findFirst({
        where: { name: { contains: projectData.projectType.toLowerCase() } }
      });
      
      if (!workflow) continue;

      const admin = await prisma.user.findFirst({
        where: { role: "ADMIN" }
      });

      if (!admin) continue;

      const project = await prisma.project.create({
        data: {
          ...projectData,
          workflowId: workflow.id,
          managerId: admin.id
        }
      });

      // Get workflow phases and create project phases
      const phases = await prisma.phase.findMany({
        where: { workflowId: workflow.id },
        include: { tasks: true }
      });

      for (const phase of phases) {
        const projectPhase = await prisma.projectPhase.create({
          data: {
            name: phase.name,
            description: phase.description,
            order: phase.order,
            projectId: project.id,
            phaseId: phase.id
          }
        });

        // Create project tasks
        for (const task of phase.tasks) {
          await prisma.projectTask.create({
            data: {
              name: task.name,
              description: task.description,
              priority: task.priority,
              manHours: task.manHours,
              order: task.order,
              projectPhaseId: projectPhase.id,
              workflowTaskId: task.id,
              departmentId: task.departmentId
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error in seed:', error)
    throw error
  }
}

async function seedChecklistTemplates() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  })

  if (!admin) throw new Error("Admin user not found")

  const workflow = await prisma.workflow.findFirst({
    where: { name: "Vehicle Wrap Workflow" }
  })

  if (!workflow) throw new Error("Workflow not found")

  const designPhase = await prisma.phase.findFirst({
    where: { 
      workflowId: workflow.id,
      name: "Design"
    }
  })

  const productionPhase = await prisma.phase.findFirst({
    where: { 
      workflowId: workflow.id,
      name: "Production"
    }
  })

  const designDepartment = await prisma.department.findFirst({
    where: { name: "Design" }
  })

  const productionDepartment = await prisma.department.findFirst({
    where: { name: "Production" }
  })

  // Create Pre-Design Layout Checklist
  await createChecklistTemplate(
    workflow,
    designPhase,
    designDepartment,
    admin,
    "PRE-DESIGN LAYOUT MEETING",
    [
      "Review physical inspection form(s) with all departments",
      "Review & document wrapable areas",
      "Review & document un-wrapable areas",
      "General design do & don't review",
      "Seams and panel plan reviewed"
    ]
  )

  // Create Vehicle Measurement Checklist
  await createChecklistTemplate(
    workflow,
    designPhase,
    designDepartment,
    admin,
    "VEHICLE MEASUREMENT CHECKLIST",
    [
      "Photographed all sides of vehicle straight on using iPad",
      "Photographed VIN Number",
      "Customers name written on first photographed",
      "Measured vehicle from furthest point to furthest point, horizontally and vertically, using different colors for each",
      "Marked measurements of locations of all door seams, indents, door handles, etc",
      "Made note of any unwrappable areas",
      "Confirmed window coverage and measured accordingly",
      "Confirmed roof coverage and measured accordingly",
      "Confirmed bumper coverage and measured accordingly",
      "Confirmed iPad Photos synced with Mac Photos",
      "Moved photos from Mac Photos app into Before Photos folder in Clients folder",
      "Moved measured photos into Measurements & Blueprints folder in Clients folder"
    ]
  )

  // Create Graphic Design Checklist
  await createChecklistTemplate(
    workflow,
    designPhase,
    designDepartment,
    admin,
    "GRAPHIC DESIGN CHECKLIST",
    [
      "Art Direction Form Completed",
      "Rough Mock-up Designed & saved to Design In Progress folder",
      "Rough Mock-up sent to Art Director for Approval",
      "Design sent to customer via GoProof using Proof Sheet",
      "ROUGH MOCK APPROVED BY CLIENT",
      "Pre-design layout meeting had with departments to review vehicle",
      "Template Downloaded from 'TheBadWrap.com' or created from photos - Color Profile: sRGB IEC61966-2.1",
      "Template Confirmed using measurements/areas to avoid & placed in Empty Vehicle Templates",
      "Customer collateral confirmed - usable and located in Collaterals folder on server",
      "High Resolution design made - all sides on confirmed template w/ locked Horizon line",
      "Proof submitted for internal review/spell check and sent to client",
      "FINAL DESIGN APPROVED BY CLIENT -Approval Printed and placed in Traveler",
      "Finalize Files & place in Final Designs folder",
      "IF CUT GRAPHICS ARE INCLUDED IN DESIGN: Cut Graphics created and placed in SummaCut Files folder",
      "Create Cut Graphics Form, Print, and place in traveler",
      "Create Blueprints, Print and place in traveler",
      "All Final Approved all sided proofs printed as separate pages and on one single sheet and placed in traveler",
      "Full-Size Before Pictures printed and placed in traveler",
      "Customer Approval printed and placed in traveler",
      "IF REPEAT PROJECT: After Pictures of last wrap printed and placed in traveler;CHECK Flett Box on print sheet"
    ]
  )

  // Create Paneling/Prepress Checklist
  await createChecklistTemplate(
    workflow,
    designPhase,
    designDepartment,
    admin,
    "PANELING/PREPRESS CHECKLIST",
    [
      "Confirmed previous departments paperwork is signed off",
      "Printed approval and final files compared (must be the same)",
      "Confirmed template verification was completed. Checked Non-wrapable areas",
      "Confirmed proper file settings",
      "Confirmed text has been converted to shape or has anti-aliasing on and is made into smart object",
      "Confirmed proper blue prints/mechanicals/cut graphics form/proofs/photos attached",
      "Confirmed the necessary bleed was added",
      "Spell Check / Contact Info Check Completed",
      "Panels for each side MUST be paneled from final design for THAT side, even if the 'same'",
      "Files zoomed and checked for graphical errors (with template and guides off)",
      "Files checked for issues caused by mirroring sides or elements... ALL SIDES, not just Passenger/Driver",
      "Pre-Install meeting had with installer to set up panel plan and review install",
      "Panel Plan group created in layers",
      "Panels cropped out and saved as TIF files in Print Ready Panels folder",
      "Panel Plan Sheet filled out to confirm measurements",
      "Panel Plan printed for ALL SIDES of vehicle whether side has panels or not",
      "Contact Sheet of cropped panels printed using Adobe Bridge",
      "Confirmed color consistency using Contact Sheet"
    ]
  )

  // Create Print Checklist
  await createChecklistTemplate(
    workflow,
    productionPhase,
    productionDepartment,
    admin,
    "PRINT CHECKLIST",
    [
      "CONFIRMED PRINTER IS UP TO DATE WITH PREVENTATIVE MAINTENANCE",
      "Performed a Full Print Optimization Process",
      "Confirmed that 'space between print' settings in ONYX is .5' for standard; 2.5-3' for cut graphics using plotter",
      "Confirmed that substrate in printer matches job requirements for the project",
      "Confirmed that printer has enough substrate as required for what you just loaded to print",
      "Confirmed that take up roll is attached to vinyl in printer (or a plan for catching vinyl is set)",
      "Confirmed that substrate in printer was advanced if needed for tape marks and/or damaged areas to clear the final printing area",
      "Confirmed that all panels being printed have been TURNED and EXPANDED to ACTUAL PRINT SIZE",
      "Confirmed wrap panels with white backgrounds have crop marks/frame to aid in cutting",
      "Confirm edge clips are in proper position",
      "Confirmed that if multiple PRINT CUTS jobs are being printed, 'conserve media' is NOT selected and they are printed as individual jobs with their own barcodes",
      "Confirmed that all ink levels in printer are ready to print. MUST BE IN THE SHOP to change inks if any color is less than 10% full or a solid color is being printed",
      "Changed Ink Cartridges below 10%, if necessary, when setting up printer for overnight printing",
      "Confirmed gutter is included in print MUST GET SIGN OFF TO NOT INCLUDE",
      "Print Test Prints: To test photo quality and colors MUST GET SIGNED; View outside",
      "Before photo printed for rolling wall",
      "Compared Printed Color to Paint Wrap if color Paint Wrap is being used",
      "If Wrap is from a Fleet (see check box at top of page) Compared Printed Sample to Past Printed Sample/photo(s)",
      "Vinyl usage under 85% must be discussed",
      "Printer must be watched while printing first panel and checked every 10 minutes to confirm no issues occur"
    ]
  )

  // Create Lamination & Trimming Checklist
  await createChecklistTemplate(
    workflow,
    productionPhase,
    productionDepartment,
    admin,
    "LAMINATION & TRIMMING CHECKLIST",
    [
      "CONFIRMED WHETHER LAMINATION IS NEEDED OR NOT, CHECK PRINT PAPERWORK",
      "Confirmed there is enough lamination to complete your project",
      "Load vinyl roll on proper bar depending on length of project",
      "Attached take up real for long runs or if you are laminating alone",
      "Reviewed panels while lamination occurs for obvious issues",
      "Swiffered panels as they are being laminated to reduce lint, dirt ect.",
      "Confirmed panels that are laminated - if possible may need to occur during trim; CHECKLIST",
      "Trimmed panels leaving 5' at both ends of Print Cut files and removing excess lamination!",
      "Trim panels that need to be sewn together and compare edges to confirm color matches",
      "Confirm COMPLETE panel inventory and package/cart project for installation; CHECKLIST"
    ]
  )
}

async function createChecklistTemplate(
  workflow: any,
  phase: any,
  department: any,
  admin: any,
  name: string,
  items: string[]
) {
  if (!workflow || !phase || !department || !admin) return

  await prisma.formTemplate.create({
    data: {
      name,
      description: `Checklist for ${name.toLowerCase()}`,
      workflowId: workflow.id,
      phaseId: phase.id,
      departmentId: department.id,
      isActive: true,
      order: 0,
      schema: {
        sections: [
          {
            id: crypto.randomUUID(),
            title: name,
            type: "CHECKLIST",
            fields: items.map(item => ({
              id: crypto.randomUUID(),
              label: item,
              type: "checkbox",
              required: true,
              options: []
            }))
          }
        ]
      },
      layout: {
        sections: [
          {
            id: crypto.randomUUID(),
            title: name,
            type: "CHECKLIST",
            fields: items.map(item => ({
              id: crypto.randomUUID(),
              label: item,
              type: "checkbox"
            }))
          }
        ]
      },
      style: {
        theme: "default"
      },
      metadata: {
        version: 1,
        lastUpdated: new Date().toISOString()
      },
      currentVersion: 1,
      versions: {
        create: {
          version: 1,
          schema: {
            sections: [
              {
                id: crypto.randomUUID(),
                title: name,
                type: "CHECKLIST",
                fields: items.map(item => ({
                  id: crypto.randomUUID(),
                  label: item,
                  type: "checkbox",
                  required: true,
                  options: []
                }))
              }
            ]
          },
          isActive: true,
          createdById: admin.id,
          changelog: "Initial version"
        }
      }
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 