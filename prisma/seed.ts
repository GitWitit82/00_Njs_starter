import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user if it doesn't exist
  const adminUser = await prisma.user.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      email: "admin@example.com",
      hashedPassword: await hash("1234", 10),
      role: "ADMIN",
    },
  });

  // Create default workflows if they don't exist
  const vehicleWrapWorkflow = await prisma.workflow.upsert({
    where: { id: "vehicle-wrap-workflow" },
    update: {},
    create: {
      id: "vehicle-wrap-workflow",
      name: "Vehicle Wrap Standard",
      description: "Standard workflow for vehicle wrap projects",
      phases: {
        create: [
          {
            name: "Planning",
            description: "Initial planning and design phase",
            order: 1,
            tasks: {
              create: [
                {
                  name: "Initial Consultation",
                  description: "Meet with client to discuss requirements",
                  priority: "HIGH",
                  order: 1,
                  manHours: 2,
                },
                {
                  name: "Design Approval",
                  description: "Get client approval on design",
                  priority: "HIGH",
                  order: 2,
                  manHours: 4,
                },
              ],
            },
          },
          {
            name: "Production",
            description: "Vehicle wrap production phase",
            order: 2,
            tasks: {
              create: [
                {
                  name: "Material Preparation",
                  description: "Prepare wrap materials",
                  priority: "MEDIUM",
                  order: 1,
                  manHours: 4,
                },
                {
                  name: "Installation",
                  description: "Install vehicle wrap",
                  priority: "HIGH",
                  order: 2,
                  manHours: 8,
                },
              ],
            },
          },
          {
            name: "Quality Control",
            description: "Final inspection and client approval",
            order: 3,
            tasks: {
              create: [
                {
                  name: "Final Inspection",
                  description: "Quality check of installed wrap",
                  priority: "HIGH",
                  order: 1,
                  manHours: 2,
                },
                {
                  name: "Client Approval",
                  description: "Get final client sign-off",
                  priority: "HIGH",
                  order: 2,
                  manHours: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const signWorkflow = await prisma.workflow.upsert({
    where: { id: "sign-workflow" },
    update: {},
    create: {
      id: "sign-workflow",
      name: "Sign Project Standard",
      description: "Standard workflow for sign projects",
      phases: {
        create: [
          {
            name: "Design",
            description: "Design and planning phase",
            order: 1,
            tasks: {
              create: [
                {
                  name: "Design Creation",
                  description: "Create initial design",
                  priority: "HIGH",
                  order: 1,
                  manHours: 4,
                },
              ],
            },
          },
          {
            name: "Production",
            description: "Sign production phase",
            order: 2,
            tasks: {
              create: [
                {
                  name: "Material Selection",
                  description: "Select and order materials",
                  priority: "MEDIUM",
                  order: 1,
                  manHours: 2,
                },
                {
                  name: "Fabrication",
                  description: "Fabricate the sign",
                  priority: "HIGH",
                  order: 2,
                  manHours: 8,
                },
              ],
            },
          },
          {
            name: "Installation",
            description: "Sign installation phase",
            order: 3,
            tasks: {
              create: [
                {
                  name: "Site Preparation",
                  description: "Prepare installation site",
                  priority: "MEDIUM",
                  order: 1,
                  manHours: 4,
                },
                {
                  name: "Installation",
                  description: "Install the sign",
                  priority: "HIGH",
                  order: 2,
                  manHours: 6,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const muralWorkflow = await prisma.workflow.upsert({
    where: { id: "mural-workflow" },
    update: {},
    create: {
      id: "mural-workflow",
      name: "Mural Project Standard",
      description: "Standard workflow for mural projects",
      phases: {
        create: [
          {
            name: "Design",
            description: "Design and planning phase",
            order: 1,
            tasks: {
              create: [
                {
                  name: "Site Survey",
                  description: "Survey the mural location",
                  priority: "HIGH",
                  order: 1,
                  manHours: 2,
                },
                {
                  name: "Design Creation",
                  description: "Create mural design",
                  priority: "HIGH",
                  order: 2,
                  manHours: 8,
                },
                {
                  name: "Client Approval",
                  description: "Get client approval on design",
                  priority: "HIGH",
                  order: 3,
                  manHours: 2,
                },
              ],
            },
          },
          {
            name: "Preparation",
            description: "Surface preparation phase",
            order: 2,
            tasks: {
              create: [
                {
                  name: "Surface Cleaning",
                  description: "Clean and prepare the surface",
                  priority: "HIGH",
                  order: 1,
                  manHours: 4,
                },
                {
                  name: "Priming",
                  description: "Prime the surface",
                  priority: "HIGH",
                  order: 2,
                  manHours: 4,
                },
              ],
            },
          },
          {
            name: "Painting",
            description: "Mural painting phase",
            order: 3,
            tasks: {
              create: [
                {
                  name: "Base Colors",
                  description: "Apply base colors",
                  priority: "HIGH",
                  order: 1,
                  manHours: 8,
                },
                {
                  name: "Details",
                  description: "Paint detailed elements",
                  priority: "HIGH",
                  order: 2,
                  manHours: 16,
                },
                {
                  name: "Final Touches",
                  description: "Add finishing touches",
                  priority: "MEDIUM",
                  order: 3,
                  manHours: 4,
                },
              ],
            },
          },
          {
            name: "Completion",
            description: "Project completion phase",
            order: 4,
            tasks: {
              create: [
                {
                  name: "Quality Check",
                  description: "Final quality inspection",
                  priority: "HIGH",
                  order: 1,
                  manHours: 2,
                },
                {
                  name: "Protective Coating",
                  description: "Apply protective coating",
                  priority: "HIGH",
                  order: 2,
                  manHours: 4,
                },
                {
                  name: "Client Sign-off",
                  description: "Get final client approval",
                  priority: "HIGH",
                  order: 3,
                  manHours: 1,
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