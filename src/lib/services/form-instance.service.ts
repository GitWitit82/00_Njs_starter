import { FormInstance, FormResponse, FormResponseHistory } from "@prisma/client"

/**
 * Service for managing form instances and responses
 */
export class FormInstanceService {
  /**
   * Creates a form instance when a project is created
   */
  static async createInstance(
    templateId: string,
    versionId: string,
    projectId: string,
    projectTaskId: string
  ): Promise<FormInstance> {
    const response = await fetch("/api/forms/instances", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateId,
        versionId,
        projectId,
        projectTaskId,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create form instance")
    }

    return response.json()
  }

  /**
   * Gets a form instance by ID
   */
  static async getInstance(instanceId: string): Promise<FormInstance> {
    const response = await fetch(`/api/forms/instances/${instanceId}`)
    if (!response.ok) {
      throw new Error("Failed to fetch form instance")
    }
    return response.json()
  }

  /**
   * Gets all form instances for a project
   */
  static async getProjectInstances(projectId: string): Promise<FormInstance[]> {
    const response = await fetch(`/api/forms/instances?projectId=${projectId}`)
    if (!response.ok) {
      throw new Error("Failed to fetch project form instances")
    }
    return response.json()
  }

  /**
   * Creates a new form response
   */
  static async createResponse(
    instanceId: string,
    data: {
      data: any
      metadata?: any
      version: number
    }
  ): Promise<FormResponse> {
    const response = await fetch(`/api/forms/instances/${instanceId}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create form response")
    }

    return response.json()
  }

  /**
   * Updates a form response
   */
  static async updateResponse(
    instanceId: string,
    responseId: string,
    data: {
      data?: any
      metadata?: any
      status?: string
      comments?: string
    }
  ): Promise<FormResponse> {
    const response = await fetch(
      `/api/forms/instances/${instanceId}/responses/${responseId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      throw new Error("Failed to update form response")
    }

    return response.json()
  }

  /**
   * Gets response history for a form response
   */
  static async getResponseHistory(
    instanceId: string,
    responseId: string
  ): Promise<FormResponseHistory[]> {
    const response = await fetch(
      `/api/forms/instances/${instanceId}/responses/${responseId}/history`
    )
    if (!response.ok) {
      throw new Error("Failed to fetch response history")
    }
    return response.json()
  }

  /**
   * Submits a form response for review
   */
  static async submitResponse(
    instanceId: string,
    responseId: string,
    comments?: string
  ): Promise<FormResponse> {
    const response = await fetch(
      `/api/forms/instances/${instanceId}/responses/${responseId}/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comments }),
      }
    )

    if (!response.ok) {
      throw new Error("Failed to submit form response")
    }

    return response.json()
  }

  /**
   * Reviews a form response (approve/reject)
   */
  static async reviewResponse(
    instanceId: string,
    responseId: string,
    data: {
      status: "APPROVED" | "REJECTED"
      comments?: string
    }
  ): Promise<FormResponse> {
    const response = await fetch(
      `/api/forms/instances/${instanceId}/responses/${responseId}/review`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      throw new Error("Failed to review form response")
    }

    return response.json()
  }
} 