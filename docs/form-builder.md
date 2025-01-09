# Form Builder Documentation

## Table of Contents
1. [Overview](#overview)
2. [Form Structure](#form-structure)
3. [User Interface](#user-interface)
4. [Field Types](#field-types)
5. [Layout System](#layout-system)
6. [Styling System](#styling-system)
7. [Version Control](#version-control)
8. [Integration with Projects](#integration-with-projects)
9. [Examples](#examples)

## Overview

The Form Builder is a flexible system for creating and managing form templates within the workflow management system. It supports:

- Department-specific styling and branding
- Split view layout with live preview
- Accordion-based section management
- Auto-population of project details
- Conditional fields and validation
- Custom layouts and sections
- Version control and history tracking
- Form response tracking and approvals

## Form Structure

### Basic Template Structure
```typescript
{
  name: string;              // Form template name
  description?: string;      // Optional description
  departmentId?: string;    // Associated department
  workflowId?: string;      // Associated workflow
  phaseId?: string;         // Associated workflow phase
  sections: Section[];      // Form sections
  isActive: boolean;        // Form status
  userId: string;           // Creator ID
  createdAt: DateTime;      // Creation timestamp
  updatedAt: DateTime;      // Last update timestamp
}
```

### Section Definition
```typescript
{
  id: string;               // Unique section identifier
  title: string;            // Section title
  description?: string;     // Optional description
  items: FormItem[];       // Form items in this section
}
```

### Form Item Definition
```typescript
{
  id: string;               // Unique item identifier
  type: ItemType;           // Field type
  content: string;          // Field label/content
  required?: boolean;       // Whether field is required
  options?: string[];      // Options for select/radio/checkbox/checklist
  size?: "small" | "normal" | "large";  // Size for textarea
  layout: {
    width: "full" | "half" | "third"    // Field width
  }
}
```

## User Interface

### Split View Layout
The form builder implements a split view layout with:
- Left panel: Form building interface
- Right panel: Live preview
- Resizable divider between panels
- Real-time preview updates

### Form Details Accordion
The form details section includes:
- Form name and description
- Department selection
- Workflow association
- Phase selection
- Consistent styling with other form elements

### Section Management
Sections are managed through an accordion interface:
- Expandable/collapsible sections
- Auto-focus on newly added sections
- Section title and description fields
- Add/remove section functionality

## Field Types

### Available Fields
- `TEXT`: Single line text input with adjustable width
- `TEXTAREA`: Multi-line text input with size options (small/normal/large)
- `SELECT`: Dropdown selection with multiple options
- `RADIO`: Radio button group with customizable options
- `CHECKBOX`: Multiple checkboxes with customizable options
- `CHECKLIST`: Numbered task list with completion circles

### Checklist Features
- Black header with "TASKS" label
- Numbered tasks
- Completion circles
- Bordered layout
- Direct task editing
- Add/remove task functionality

### Field Properties
```typescript
interface FieldOptions {
  options?: string[];       // Options for select/radio/checkbox/checklist
  size?: "small" | "normal" | "large";  // Size for textarea
  width: "full" | "half" | "third";     // Field width in layout
}
```

## Layout System

### Responsive Grid
- Full-width (12 columns)
- Half-width (6 columns)
- Third-width (4 columns)
- Automatic responsive behavior

### Section Layout
- Accordion-based section management
- Consistent spacing and margins
- Clear visual hierarchy

### Preview Layout
- Real-time preview updates
- Accurate representation of final form
- Department color integration
- Responsive design preview

## Styling System

### Department Integration
- Department color in preview header
- Consistent styling across form elements
- Automatic color updates on department change

### Component Styling
```typescript
interface Style {
  // Form Elements
  input: {
    border: string;
    padding: string;
    borderRadius: string;
  };
  
  // Checklist Styling
  checklist: {
    header: {
      background: "black";
      color: "white";
      padding: string;
    };
    task: {
      border: string;
      numberWidth: string;
      circleSize: string;
    };
  };
  
  // Accordion Styling
  accordion: {
    border: string;
    borderRadius: string;
    padding: string;
  };
}
```

## Version Control

### Version Management
Forms support full version control with the following features:

- Version history tracking
- Changelog documentation
- Version comparison
- Version restoration
- Active version management

### Version Structure
\`\`\`typescript
interface FormVersion {
  id: string;
  version: number;
  templateId: string;
  schema: Json;        // Form structure/fields
  layout?: Json;       // Layout configuration
  style?: Json;        // Styling configuration
  metadata?: Json;     // Additional metadata
  isActive: boolean;
  createdAt: DateTime;
  createdById: string;
  changelog?: string;  // Description of changes
}
\`\`\`

### Creating New Versions
When creating a new version:
1. Save current template state
2. Increment version number
3. Record changelog message
4. Track who made the changes
5. Maintain previous versions

### Version Comparison
The system provides detailed comparison between versions:
- Schema changes
- Layout modifications
- Style updates
- Metadata differences

### Version Restoration
To restore a previous version:
1. Select the desired version
2. Review the changes
3. Confirm restoration
4. System updates current version

## Integration with Projects

### Auto-Population
Forms can auto-populate fields from:
- Project details
- Phase information
- Department data
- User information

### Response Handling
\`\`\`typescript
interface FormResponse {
  data: object;            // Form data
  status: ResponseStatus;  // DRAFT | SUBMITTED | APPROVED | REJECTED
  submittedBy?: User;     // User who submitted
  submittedAt?: Date;     // Submission timestamp
  reviewedBy?: User;      // Reviewer
  reviewedAt?: Date;      // Review timestamp
  comments?: string;      // Review comments
  version: number;        // Form version used
}
\`\`\`

## Examples

### 1. Print Checklist Template
\`\`\`typescript
const printChecklistTemplate = {
  name: "Print Quality Checklist",
  type: "CHECKLIST",
  departmentId: "print-dept-id",
  currentVersion: 1,
  schema: {
    fields: [
      {
        id: "printer",
        type: "RADIO",
        label: "Printer",
        required: true,
        options: ["HP365", "HP570"]
      },
      // ... more fields
    ],
    sections: [
      {
        id: "setup",
        title: "Printer Setup",
        fields: ["printer", "substrate"]
      }
    ]
  },
  layout: {
    type: "sections",
    header: {
      type: "banner",
      backgroundColor: "#004B93"
    }
  }
}
\`\`\`

### API Usage

#### Version Management
\`\`\`typescript
// Get all versions
const response = await fetch('/api/forms/templates/${templateId}/versions');

// Get specific version
const response = await fetch('/api/forms/templates/${templateId}/versions/${versionId}');

// Create new version
const response = await fetch('/api/forms/templates/${templateId}/versions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    schema: updatedSchema,
    changelog: "Updated field validation rules"
  })
});

// Restore version
const response = await fetch('/api/forms/templates/${templateId}/versions/${versionId}', {
  method: 'POST'
});
\`\`\` 