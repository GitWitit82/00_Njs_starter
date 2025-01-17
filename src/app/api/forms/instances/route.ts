import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { FormInstanceStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

const createInstanceSchema = z.object({
  templateId: z.string(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  data: z.unknown().default({}),
  metadata: z.unknown().optional(),
});

const querySchema = z.object({
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  status: z.nativeEnum(FormInstanceStatus).optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const validatedQuery = querySchema.parse(Object.fromEntries(searchParams));

  const where: Prisma.FormInstanceWhereInput = {};
  Object.entries(validatedQuery).forEach(([key, value]) => {
    if (value) {
      where[key as keyof Prisma.FormInstanceWhereInput] = value;
    }
  });

  const [instances, count] = await Promise.all([
    prisma.formInstance.findMany({
      where,
      include: {
        template: {
          include: {
            version: true,
            formCompletionRequirements: {
              include: {
                dependsOn: true,
              },
            },
          },
        },
        project: true,
        task: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.formInstance.count({ where }),
  ]);

  return NextResponse.json({ instances, count });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const validatedBody = createInstanceSchema.parse(await request.json());

  const template = await prisma.formTemplate.findUnique({
    where: { id: validatedBody.templateId },
    include: {
      version: true,
      formCompletionRequirements: {
        include: {
          dependsOn: true,
        },
      },
    },
  });

  if (!template) {
    return NextResponse.json(
      { error: "Form template not found" },
      { status: 404 }
    );
  }

  if (!template.version) {
    return NextResponse.json(
      { error: "Form template has no version" },
      { status: 404 }
    );
  }

  const data = validatedBody.data || template.version.defaultValues || {};
  const metadata = validatedBody.metadata || {};

  const formInstance = await prisma.formInstance.create({
    data: {
      templateId: template.id,
      versionId: template.version.id,
      projectId: validatedBody.projectId,
      taskId: validatedBody.taskId,
      status: FormInstanceStatus.DRAFT,
      data: data as Prisma.JsonObject,
      metadata: metadata as Prisma.JsonObject,
    },
    include: {
      template: {
        include: {
          version: true,
          formCompletionRequirements: {
            include: {
              dependsOn: true,
            },
          },
        },
      },
      project: true,
      task: true,
    },
  });

  return NextResponse.json(formInstance);
} 