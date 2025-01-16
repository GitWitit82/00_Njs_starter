import { prisma } from "@/lib/prisma"
import { addBusinessDays, isAfter, isBefore, startOfDay } from "date-fns"

/**
 * Service for handling task scheduling functionality
 */
export class TaskSchedulingService {
  /**
   * Calculate the end date for a task based on start date and man hours
   * Assumes 8-hour workdays and skips weekends
   */
  static calculateEndDate(startDate: Date, manHours: number): Date {
    const hoursPerDay = 8
    const daysNeeded = Math.ceil(manHours / hoursPerDay)
    return addBusinessDays(startDate, daysNeeded)
  }

  /**
   * Schedule a task with given constraints
   */
  static async scheduleTask(taskId: string, startDate: Date) {
    const task = await prisma.projectTask.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        phase: true
      }
    })

    if (!task) throw new Error("Task not found")

    const endDate = this.calculateEndDate(startDate, task.manHours)

    // Validate against project dates
    if (task.project.endDate && isAfter(endDate, task.project.endDate)) {
      throw new Error("Task end date exceeds project end date")
    }

    if (isBefore(startDate, task.project.startDate)) {
      throw new Error("Task start date is before project start date")
    }

    // Update task schedule
    return prisma.projectTask.update({
      where: { id: taskId },
      data: {
        scheduledStart: startDate,
        scheduledEnd: endDate,
        taskActivities: {
          create: {
            type: "SCHEDULE_UPDATE",
            details: `Task scheduled: ${startDate.toISOString()} - ${endDate.toISOString()}`,
            userId: "system" // You might want to pass the actual user ID
          }
        }
      }
    })
  }

  /**
   * Update actual start/end dates for a task
   */
  static async updateActualDates(taskId: string, data: {
    actualStart?: Date
    actualEnd?: Date
  }) {
    const task = await prisma.projectTask.findUnique({
      where: { id: taskId }
    })

    if (!task) throw new Error("Task not found")

    return prisma.projectTask.update({
      where: { id: taskId },
      data: {
        actualStart: data.actualStart,
        actualEnd: data.actualEnd,
        status: data.actualEnd ? "COMPLETED" : (data.actualStart ? "IN_PROGRESS" : task.status),
        taskActivities: {
          create: {
            type: "ACTUAL_DATES_UPDATE",
            details: `Actual dates updated: Start - ${data.actualStart?.toISOString() || 'N/A'}, End - ${data.actualEnd?.toISOString() || 'N/A'}`,
            userId: "system" // You might want to pass the actual user ID
          }
        }
      }
    })
  }

  /**
   * Calculate schedule efficiency (actual vs planned duration)
   */
  static calculateEfficiency(task: {
    scheduledStart?: Date | null
    scheduledEnd?: Date | null
    actualStart?: Date | null
    actualEnd?: Date | null
  }): number | null {
    if (!task.scheduledStart || !task.scheduledEnd || !task.actualStart || !task.actualEnd) {
      return null
    }

    const plannedDuration = task.scheduledEnd.getTime() - task.scheduledStart.getTime()
    const actualDuration = task.actualEnd.getTime() - task.actualStart.getTime()

    return (plannedDuration / actualDuration) * 100
  }

  /**
   * Get task schedule metrics for a project
   */
  static async getProjectMetrics(projectId: string) {
    const tasks = await prisma.projectTask.findMany({
      where: { projectId },
      select: {
        scheduledStart: true,
        scheduledEnd: true,
        actualStart: true,
        actualEnd: true,
        manHours: true
      }
    })

    let totalEfficiency = 0
    let tasksWithEfficiency = 0
    let totalPlannedHours = 0
    let totalActualHours = 0

    tasks.forEach(task => {
      const efficiency = this.calculateEfficiency(task)
      if (efficiency !== null) {
        totalEfficiency += efficiency
        tasksWithEfficiency++
      }

      totalPlannedHours += task.manHours
      if (task.actualStart && task.actualEnd) {
        const actualHours = (task.actualEnd.getTime() - task.actualStart.getTime()) / (1000 * 60 * 60)
        totalActualHours += actualHours
      }
    })

    return {
      averageEfficiency: tasksWithEfficiency > 0 ? totalEfficiency / tasksWithEfficiency : null,
      totalPlannedHours,
      totalActualHours,
      completedTasks: tasks.filter(t => t.actualEnd).length,
      totalTasks: tasks.length
    }
  }
} 