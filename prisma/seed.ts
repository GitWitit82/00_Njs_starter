import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user if it doesn't exist
  await prisma.$executeRaw`
    INSERT INTO "User" (id, name, email, role, password, "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      'admin',
      'admin@example.com',
      'ADMIN',
      ${await hash("admin123", 10)},
      NOW(),
      NOW()
    )
    ON CONFLICT (name) DO NOTHING;
  `;

  // Create departments
  const departments = [
    { name: "Marketing", color: "#FF5733", description: "Marketing department" },
    { name: "Project Management", color: "#33FF57", description: "Project Management department" },
    { name: "Graphic Design", color: "#3357FF", description: "Graphic Design department" },
    { name: "Finance", color: "#FF33F5", description: "Finance department" },
    { name: "Production", color: "#33FFF5", description: "Production department" },
    { name: "Installation", color: "#F5FF33", description: "Installation department" },
    { name: "Prep", color: "#FF3333", description: "Prep department" },
    { name: "All Departments", color: "#333333", description: "All departments" },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
  }

  // Get department references
  const deptRefs = await prisma.department.findMany();
  const getDeptId = (name: string) => deptRefs.find(d => d.name === name)?.id || "";

  // Create Vehicle Wrap Standard workflow
  await prisma.workflow.upsert({
    where: { id: "vehicle-wrap-workflow" },
    update: {},
    create: {
      id: "vehicle-wrap-workflow",
      name: "Vehicle Wrap Standard",
      description: "Standard workflow for vehicle wrap projects",
      phases: {
        create: [
          {
            name: "Marketing",
            description: "Marketing and initial client interaction phase",
            order: 1,
            tasks: {
              create: [
                {
                  name: "Creative Concept Meeting",
                  description: "Initial creative concept meeting with client",
                  priority: "HIGH",
                  order: 1,
                  manHours: 0.25,
                  departmentId: getDeptId("Marketing"),
                },
                {
                  name: "Follow up Email",
                  description: "Send follow up email to client",
                  priority: "MEDIUM",
                  order: 2,
                  manHours: 0.083,
                  departmentId: getDeptId("Project Management"),
                },
                {
                  name: "Rough Mock up",
                  description: "Create rough mock up of design",
                  priority: "HIGH",
                  order: 3,
                  manHours: 1,
                  departmentId: getDeptId("Graphic Design"),
                },
                {
                  name: "Photos & Sizing",
                  description: "Take photos and measurements",
                  priority: "HIGH",
                  order: 4,
                  manHours: 0.75,
                  departmentId: getDeptId("Graphic Design"),
                },
                {
                  name: "Physical Inspection",
                  description: "Conduct physical inspection",
                  priority: "HIGH",
                  order: 5,
                  manHours: 0.5,
                  departmentId: getDeptId("All Departments"),
                },
                {
                  name: "$$$ Confirm and Update Invoice",
                  description: "Update and confirm invoice",
                  priority: "HIGH",
                  order: 6,
                  manHours: 0.25,
                  departmentId: getDeptId("Finance"),
                },
              ],
            },
          },
          {
            name: "Design",
            description: "Design and approval phase",
            order: 2,
            tasks: {
              create: [
                {
                  name: "Pre-Design Layout Meeting",
                  description: "Meeting to discuss design layout",
                  priority: "HIGH",
                  order: 1,
                  manHours: 0.5,
                  departmentId: getDeptId("Project Management"),
                },
                {
                  name: "Create and verify Template",
                  description: "Create and verify design template",
                  priority: "HIGH",
                  order: 2,
                  manHours: 1,
                  departmentId: getDeptId("Graphic Design"),
                },
                {
                  name: "Start High Res Design",
                  description: "Begin high resolution design work",
                  priority: "HIGH",
                  order: 3,
                  manHours: 1.5,
                  departmentId: getDeptId("Graphic Design"),
                },
                {
                  name: "Art Direction Sign Off",
                  description: "Get art direction approval",
                  priority: "HIGH",
                  order: 4,
                  manHours: 0.083,
                  departmentId: getDeptId("Project Management"),
                },
                {
                  name: "Customer Sign Off",
                  description: "Get customer approval",
                  priority: "HIGH",
                  order: 5,
                  manHours: 0.083,
                  departmentId: getDeptId("Project Management"),
                },
                {
                  name: "Final Design",
                  description: "Complete final design",
                  priority: "HIGH",
                  order: 6,
                  manHours: 1.5,
                  departmentId: getDeptId("Graphic Design"),
                },
                {
                  name: "Internal Proof",
                  description: "Internal design proof review",
                  priority: "HIGH",
                  order: 7,
                  manHours: 1.5,
                  departmentId: getDeptId("Graphic Design"),
                },
                {
                  name: "Art Direction Sign Off",
                  description: "Final art direction approval",
                  priority: "HIGH",
                  order: 8,
                  manHours: 0.25,
                  departmentId: getDeptId("Project Management"),
                },
                {
                  name: "Customer Sign Off",
                  description: "Final customer approval",
                  priority: "HIGH",
                  order: 9,
                  manHours: 0.083,
                  departmentId: getDeptId("Project Management"),
                },
                {
                  name: "$$$ Confirm Customer Deposit",
                  description: "Confirm customer deposit received",
                  priority: "HIGH",
                  order: 10,
                  manHours: 0.083,
                  departmentId: getDeptId("Finance"),
                },
                {
                  name: "Firm Hold Schedule Installation Drop Off",
                  description: "Schedule installation and drop off",
                  priority: "HIGH",
                  order: 11,
                  manHours: 0.25,
                  departmentId: getDeptId("Project Management"),
                },
              ],
            },
          },
          {
            name: "Production",
            description: "Production and materials phase",
            order: 3,
            tasks: {
              create: [
                {
                  name: "Order Raw Materials",
                  description: "Order necessary materials",
                  priority: "HIGH",
                  order: 1,
                  manHours: 0.25,
                  departmentId: getDeptId("Project Management"),
                },
                {
                  name: "Make Installer Sheet",
                  description: "Prepare installer documentation",
                  priority: "HIGH",
                  order: 2,
                  manHours: 0.25,
                  departmentId: getDeptId("Installation"),
                },
                {
                  name: "Print Ready Files Blue Prints and Review",
                  description: "Prepare and review print files",
                  priority: "HIGH",
                  order: 3,
                  manHours: 0.5,
                  departmentId: getDeptId("Graphic Design"),
                },
                {
                  name: "Create Test Print",
                  description: "Create and review test print",
                  priority: "HIGH",
                  order: 4,
                  manHours: 0.25,
                  departmentId: getDeptId("Graphic Design"),
                },
                {
                  name: "Pre Install Meeting",
                  description: "Pre-installation planning meeting",
                  priority: "HIGH",
                  order: 5,
                  manHours: 1,
                  departmentId: getDeptId("Production"),
                },
                {
                  name: "Paneling",
                  description: "Panel preparation",
                  priority: "HIGH",
                  order: 6,
                  manHours: 2,
                  departmentId: getDeptId("Graphic Design"),
                },
                {
                  name: "Printing",
                  description: "Print production",
                  priority: "HIGH",
                  order: 7,
                  manHours: 1,
                  departmentId: getDeptId("Production"),
                },
                {
                  name: "Lamination & Rough QC",
                  description: "Lamination and initial quality check",
                  priority: "HIGH",
                  order: 8,
                  manHours: 0.5,
                  departmentId: getDeptId("Production"),
                },
                {
                  name: "Trim & Sew",
                  description: "Trim and sew materials",
                  priority: "HIGH",
                  order: 9,
                  manHours: 0.5,
                  departmentId: getDeptId("Production"),
                },
                {
                  name: "Plot",
                  description: "Plot production",
                  priority: "HIGH",
                  order: 10,
                  manHours: 0.5,
                  departmentId: getDeptId("Production"),
                },
                {
                  name: "Project Inventory Control / QC",
                  description: "Inventory control and quality check",
                  priority: "HIGH",
                  order: 11,
                  manHours: 0.167,
                  departmentId: getDeptId("Production"),
                },
              ],
            },
          },
          {
            name: "Prep",
            description: "Preparation phase",
            order: 4,
            tasks: {
              create: [
                {
                  name: "Intake of Item",
                  description: "Initial item intake process",
                  priority: "HIGH",
                  order: 1,
                  manHours: 0.25,
                  departmentId: getDeptId("All Departments"),
                },
                {
                  name: "Wrap Plan Set Up",
                  description: "Set up wrap plan",
                  priority: "HIGH",
                  order: 2,
                  manHours: 0.5,
                  departmentId: getDeptId("Installation"),
                },
                {
                  name: "Repairs & Vinyl Adhesive Removal",
                  description: "Repairs and removal of old materials",
                  priority: "HIGH",
                  order: 3,
                  manHours: 35,
                  departmentId: getDeptId("Prep"),
                },
                {
                  name: "Prep Clean",
                  description: "Final preparation cleaning",
                  priority: "HIGH",
                  order: 4,
                  manHours: 1.5,
                  departmentId: getDeptId("Prep"),
                },
              ],
            },
          },
          {
            name: "Body Work",
            description: "Body work phase",
            order: 5,
            tasks: {
              create: [
                {
                  name: "Putty",
                  description: "Apply putty",
                  priority: "MEDIUM",
                  order: 1,
                  manHours: 0,
                  departmentId: getDeptId("Prep"),
                },
                {
                  name: "Bondo",
                  description: "Apply bondo",
                  priority: "MEDIUM",
                  order: 2,
                  manHours: 0,
                  departmentId: getDeptId("Prep"),
                },
                {
                  name: "Dent Removal",
                  description: "Remove dents",
                  priority: "MEDIUM",
                  order: 3,
                  manHours: 0,
                  departmentId: getDeptId("Prep"),
                },
                {
                  name: "Fabrication",
                  description: "Fabrication work",
                  priority: "MEDIUM",
                  order: 4,
                  manHours: 0,
                  departmentId: getDeptId("Prep"),
                },
              ],
            },
          },
          {
            name: "Paint",
            description: "Paint application phase",
            order: 6,
            tasks: {
              create: [
                {
                  name: "Surface Prep / Degrease",
                  description: "Prepare surface and degrease",
                  priority: "HIGH",
                  order: 1,
                  manHours: 0,
                  departmentId: getDeptId("Prep"),
                },
                {
                  name: "Masking",
                  description: "Apply masking",
                  priority: "HIGH",
                  order: 2,
                  manHours: 0,
                  departmentId: getDeptId("Prep"),
                },
                {
                  name: "Primer",
                  description: "Apply primer",
                  priority: "HIGH",
                  order: 3,
                  manHours: 0,
                  departmentId: getDeptId("Prep"),
                },
                {
                  name: "Paint",
                  description: "Apply paint",
                  priority: "HIGH",
                  order: 4,
                  manHours: 0,
                  departmentId: getDeptId("Prep"),
                },
                {
                  name: "Specialty Paint/ Texture/ Bedliner",
                  description: "Apply specialty finishes",
                  priority: "HIGH",
                  order: 5,
                  manHours: 0,
                  departmentId: getDeptId("Prep"),
                },
                {
                  name: "Removal of Masking",
                  description: "Remove masking",
                  priority: "HIGH",
                  order: 6,
                  manHours: 0,
                  departmentId: getDeptId("Prep"),
                },
              ],
            },
          },
          {
            name: "Installation",
            description: "Final installation phase",
            order: 7,
            tasks: {
              create: [
                {
                  name: "Dry Hang and Photos",
                  description: "Initial dry fit and documentation",
                  priority: "HIGH",
                  order: 1,
                  manHours: 0.333,
                  departmentId: getDeptId("Installation"),
                },
                {
                  name: "Install",
                  description: "Main installation process",
                  priority: "HIGH",
                  order: 2,
                  manHours: 17.6,
                  departmentId: getDeptId("Installation"),
                },
                {
                  name: "Post Wrap",
                  description: "Post-installation wrap up",
                  priority: "HIGH",
                  order: 3,
                  manHours: 0.75,
                  departmentId: getDeptId("Prep"),
                },
                {
                  name: "QC and Photos",
                  description: "Quality control and documentation",
                  priority: "HIGH",
                  order: 4,
                  manHours: 0.5,
                  departmentId: getDeptId("Prep"),
                },
                {
                  name: "$$$ Balance",
                  description: "Process final payment",
                  priority: "HIGH",
                  order: 5,
                  manHours: 0.25,
                  departmentId: getDeptId("Finance"),
                },
                {
                  name: "Reveal",
                  description: "Project reveal to client",
                  priority: "HIGH",
                  order: 6,
                  manHours: 0.5,
                  departmentId: getDeptId("All Departments"),
                },
                {
                  name: "Debrief all Depts",
                  description: "Department debrief meeting",
                  priority: "HIGH",
                  order: 7,
                  manHours: 0.25,
                  departmentId: getDeptId("Project Management"),
                },
                {
                  name: "Close Project",
                  description: "Project closure procedures",
                  priority: "HIGH",
                  order: 8,
                  manHours: 0.25,
                  departmentId: getDeptId("Project Management"),
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 