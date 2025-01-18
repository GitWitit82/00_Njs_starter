/**
 * @file Departments Page Component
 * @description Displays and manages departments
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { DepartmentsTable } from "@/components/departments/departments-table";

export const metadata: Metadata = {
  title: "Departments",
  description: "Manage departments for task assignments",
};

export default async function DepartmentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  const departments = await prisma.department.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="container mx-auto py-10">
      <DepartmentsTable departments={departments} />
    </div>
  );
} 