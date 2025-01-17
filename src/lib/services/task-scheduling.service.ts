import { prisma } from "@/lib/db"
import { TaskStatus } from "@prisma/client"

export enum ActivityType {
  SCHEDULE_UPDATE = "SCHEDULE_UPDATE",
  ACTUAL_DATES_UPDATE = "ACTUAL_DATES_UPDATE",
  STATUS_CHANGE = "STATUS_CHANGE",
  PRIORITY_CHANGE = "PRIORITY_CHANGE",
  ASSIGNMENT_CHANGE = "ASSIGNMENT_CHANGE",
}

interface TaskScheduleData {
  scheduledStart?: Date | null
  scheduledEnd?: Date | null
  actualStart?: Date | null
  actualEnd?: Date | null
}

export class TaskSchedulingService {
  /**
   * Calculate the end date based on start date and man hours
   * Assumes 8-hour workdays and skips weekends
   */
  static calculateEndDate(startDate: Date, manHours: number): Date {
    const workHoursPerDay = 8
    const workDays = Math.ceil(manHours / workHoursPerDay)
    
    const endDate = new Date(startDate)
    let daysAdded = 0
    
    while (daysAdded < workDays) {
      endDate.setDate(endDate.getDate() + 1)
      // Skip weekends
      if (endDate.getDay() !== 0 && endDate.getDay() !== 6) {
        daysAdded++
      }
    }
    
    return endDate
  }

  /**
   * Schedule a task with given constraints
   */
  static async scheduleTask(taskId: string, startDate: Date, userId: string) {
    const task = await prisma.projectTask.findUnique({
      where: { id: taskId },
      include: {
        project: true,
      },
    })

    if (!task) {
      throw new Error("Task not found")
    }

    if (task.project) {
      const projectStartDate = task.project.startDate
      const projectEndDate = task.project.endDate

      if (startDate < projectStartDate) {
        throw new Error("Task cannot start before project start date")
      }

      if (projectEndDate && this.calculateEndDate(startDate, task.manHours) > projectEndDate) {
        throw new Error("Task duration exceeds project end date")
      }
    }

    const endDate = this.calculateEndDate(startDate, task.manHours)

    const updatedTask = await prisma.projectTask.update({
      where: { id: taskId },
      data: {
        scheduledStart: startDate,
        scheduledEnd: endDate,
        taskActivities: {
          create: {
            type: ActivityType.SCHEDULE_UPDATE,
            userId,
            content: `Task scheduled: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
            details: JSON.stringify({ startDate, endDate }),
          },
        },
      },
      include: {
        taskActivities: true,
        project: true,
        phase: true,
        department: true,
        assignedTo: true,
      },
    })

    return updatedTask
  }

  /**
   * Update actual start and end dates for a task
   */
  static async updateActualDates(taskId: string, data: TaskScheduleData, userId: string) {
    const task = await prisma.projectTask.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      throw new Error("Task not found")
    }

    let status = task.status

    if (data.actualStart && !task.actualStart) {
      status = TaskStatus.IN_PROGRESS
    }

    if (data.actualEnd && !task.actualEnd) {
      status = TaskStatus.COMPLETED
    }

    const updatedTask = await prisma.projectTask.update({
      where: { id: taskId },
      data: {
        ...data,
        status,
        taskActivities: {
          create: {
            type: ActivityType.ACTUAL_DATES_UPDATE,
            userId,
            content: `Task actual dates updated`,
            details: JSON.stringify(data),
          },
        },
      },
      include: {
        taskActivities: true,
        project: true,
        phase: true,
        department: true,
        assignedTo: true,
      },
    })

    return updatedTask
  }

  /**
   * Calculate efficiency based on actual vs planned duration
   */
  static calculateEfficiency(task: { scheduledStart: Date | null; scheduledEnd: Date | null; actualStart: Date | null; actualEnd: Date | null }): number | null {
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
      where: {
        projectId,
        status: TaskStatus.COMPLETED,
      },
    })

    const efficiencies = tasks
      .map(task => this.calculateEfficiency(task))
      .filter((efficiency): efficiency is number => efficiency !== null)

    const averageEfficiency = efficiencies.length > 0
      ? efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length
      : null

    const totalPlannedHours = tasks.reduce((sum, task) => sum + task.manHours, 0)
    const completedTasks = tasks.length

    return {
      averageEfficiency,
      totalPlannedHours,
      completedTasks,
    }
  }
} 