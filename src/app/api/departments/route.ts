/**
 * @file Departments API Route
 * @description Handles API requests for departments
 */

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

/**
 * GET handler for retrieving all departments
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error("[DEPARTMENTS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

/**
 * POST handler for creating a new department
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const { name, description, color } = json

    const department = await prisma.department.create({
      data: {
        name,
        description,
        color,
      },
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error("[DEPARTMENTS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 