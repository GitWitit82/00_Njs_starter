import { FormTemplate, FormVersion } from "@prisma/client"

/**
 * Service for handling form version operations
 */
export class FormVersionService {
  /**
   * Get all versions of a form template
   */
  static async getVersions(templateId: string): Promise<FormVersion[]> {
    const response = await fetch(`/api/forms/templates/${templateId}/versions`)
    if (!response.ok) {
      throw new Error("Failed to fetch form versions")
    }
    return response.json()
  }

  /**
   * Get a specific version of a form template
   */
  static async getVersion(templateId: string, versionId: string): Promise<FormVersion> {
    const response = await fetch(
      `/api/forms/templates/${templateId}/versions/${versionId}`
    )
    if (!response.ok) {
      throw new Error("Failed to fetch form version")
    }
    return response.json()
  }

  /**
   * Create a new version of a form template
   */
  static async createVersion(
    templateId: string,
    data: {
      schema: any
      layout?: any
      style?: any
      metadata?: any
      changelog: string
    }
  ): Promise<FormVersion> {
    const response = await fetch(`/api/forms/templates/${templateId}/versions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to create form version")
    }
    return response.json()
  }

  /**
   * Update a specific version of a form template
   */
  static async updateVersion(
    templateId: string,
    versionId: string,
    data: {
      isActive?: boolean
      changelog?: string
    }
  ): Promise<FormVersion> {
    const response = await fetch(
      `/api/forms/templates/${templateId}/versions/${versionId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    )
    if (!response.ok) {
      throw new Error("Failed to update form version")
    }
    return response.json()
  }

  /**
   * Restore a form template to a specific version
   */
  static async restoreVersion(
    templateId: string,
    versionId: string
  ): Promise<FormTemplate> {
    const response = await fetch(
      `/api/forms/templates/${templateId}/versions/${versionId}`,
      {
        method: "POST",
      }
    )
    if (!response.ok) {
      throw new Error("Failed to restore form version")
    }
    return response.json()
  }

  /**
   * Compare two versions of a form template
   * Returns an object containing the differences between versions
   */
  static compareVersions(version1: FormVersion, version2: FormVersion): {
    schema: any[]
    layout: any[]
    style: any[]
    metadata: any[]
  } {
    return {
      schema: this.findDifferences(version1.schema, version2.schema),
      layout: this.findDifferences(version1.layout, version2.layout),
      style: this.findDifferences(version1.style, version2.style),
      metadata: this.findDifferences(version1.metadata, version2.metadata),
    }
  }

  /**
   * Helper function to find differences between two objects
   * Returns an array of differences with path and change type
   */
  private static findDifferences(obj1: any, obj2: any, path: string = ""): any[] {
    const differences: any[] = []

    if (typeof obj1 !== typeof obj2) {
      differences.push({
        path,
        type: "type_change",
        oldValue: typeof obj1,
        newValue: typeof obj2,
      })
      return differences
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      const maxLength = Math.max(obj1.length, obj2.length)
      for (let i = 0; i < maxLength; i++) {
        const currentPath = path ? `${path}[${i}]` : `[${i}]`
        if (i >= obj1.length) {
          differences.push({
            path: currentPath,
            type: "array_add",
            value: obj2[i],
          })
        } else if (i >= obj2.length) {
          differences.push({
            path: currentPath,
            type: "array_remove",
            value: obj1[i],
          })
        } else {
          differences.push(
            ...this.findDifferences(obj1[i], obj2[i], currentPath)
          )
        }
      }
      return differences
    }

    if (obj1 && obj2 && typeof obj1 === "object" && typeof obj2 === "object") {
      const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])
      for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key
        if (!(key in obj1)) {
          differences.push({
            path: currentPath,
            type: "add",
            value: obj2[key],
          })
        } else if (!(key in obj2)) {
          differences.push({
            path: currentPath,
            type: "remove",
            value: obj1[key],
          })
        } else {
          differences.push(
            ...this.findDifferences(obj1[key], obj2[key], currentPath)
          )
        }
      }
      return differences
    }

    if (obj1 !== obj2) {
      differences.push({
        path,
        type: "update",
        oldValue: obj1,
        newValue: obj2,
      })
    }

    return differences
  }
} 