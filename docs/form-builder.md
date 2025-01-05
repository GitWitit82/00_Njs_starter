# Form Builder Documentation

## Table of Contents
1. [Overview](#overview)
2. [Form Types](#form-types)
3. [Form Structure](#form-structure)
4. [Field Types](#field-types)
5. [Layout System](#layout-system)
6. [Styling System](#styling-system)
7. [Integration with Projects](#integration-with-projects)
8. [Examples](#examples)

## Overview

The Form Builder is a flexible system for creating and managing form templates within the workflow management system. It supports various types of forms, from simple checklists to complex dynamic forms, with features like:

- Department-specific styling and branding
- Auto-population of project details
- Conditional fields and validation
- Custom layouts and sections
- Form response tracking and approvals

## Form Types

### 1. CHECKLIST
- Simple yes/no or completed/not-completed items
- Ordered steps or requirements
- Support for grouping and dependencies
- Example: Print Quality Checklist, Installation Verification

### 2. FORM
- Standard data collection forms
- Multiple field types
- Structured data capture
- Example: Client Information Form, Project Specifications

### 3. CUSTOM
- Dynamic, interactive forms
- Custom validation logic
- Complex dependencies
- Example: Dynamic Pricing Calculator, Custom Design Specifications

## Form Structure

### Basic Template Structure
\`\`\`typescript
{
  name: string;              // Form template name
  description?: string;      // Optional description
  type: FormType;           // CHECKLIST | FORM | CUSTOM
  departmentId?: string;    // Associated department
  phaseId: string;          // Associated workflow phase
  schema: {
    fields: Field[];        // Form fields
    sections?: Section[];   // Optional sections for grouping
    layout?: Layout;        // Optional layout configuration
  };
  layout?: Layout;          // Global layout settings
  style?: Style;            // Styling configuration
  metadata?: Metadata;      // Additional configuration
}
\`\`\`

### Field Definition
\`\`\`typescript
{
  id: string;               // Unique field identifier
  type: FieldType;          // Field type (see Field Types section)
  label: string;            // Field label
  required?: boolean;       // Whether field is required
  defaultValue?: any;       // Default value
  options?: any[];         // Options for select/radio/etc.
  validation?: object;     // Validation rules
  metadata?: object;       // Additional field configuration
}
\`\`\`

### Section Definition
\`\`\`typescript
{
  id: string;               // Unique section identifier
  title: string;            // Section title
  description?: string;     // Optional description
  fields: string[];        // Array of field IDs in this section
}
\`\`\`

## Field Types

### Basic Fields
- \`TEXT\`: Single line text input
- \`TEXTAREA\`: Multi-line text input
- \`NUMBER\`: Numeric input
- \`CHECKBOX\`: Single checkbox
- \`RADIO\`: Radio button group
- \`SELECT\`: Dropdown selection

### Date/Time Fields
- \`DATE\`: Date picker
- \`TIME\`: Time picker
- \`DATETIME\`: Combined date and time picker

### Custom Fields
- \`CUSTOM\`: Custom field implementation

### Field Properties
\`\`\`typescript
interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: (value: any) => boolean;
}

interface FieldMetadata {
  placeholder?: string;
  helpText?: string;
  dependsOn?: string[];
  condition?: string;
  autoPopulate?: boolean;
  format?: string;
}
\`\`\`

## Layout System

### Layout Types
1. **Default Layout**
   - Standard top-to-bottom form layout
   - Fields rendered in sequence

2. **Section Layout**
   - Groups fields into sections
   - Optional section headers and descriptions

3. **Grid Layout**
   - Arranges fields in a grid system
   - Supports responsive layouts

4. **Custom Layout**
   - Define custom layout logic
   - Support for complex arrangements

### Layout Configuration
\`\`\`typescript
interface Layout {
  type: "default" | "sections" | "grid" | "custom";
  config?: {
    columns?: number;
    gap?: string;
    padding?: string;
    alignment?: "left" | "center" | "right";
  };
  header?: {
    type: "banner" | "simple";
    backgroundColor?: string;
    textColor?: string;
    actions?: Action[];
  };
  sections?: {
    [sectionId: string]: {
      layout: "full" | "half" | "third";
      style?: object;
    };
  };
}
\`\`\`

## Styling System

### Style Configuration
\`\`\`typescript
interface Style {
  // Theme Colors
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;

  // Typography
  fontFamily?: string;
  fontSize?: string;
  headingStyle?: object;

  // Components
  inputStyle?: object;
  buttonStyle?: object;
  checkboxStyle?: object;
  radioStyle?: object;

  // Layout
  spacing?: object;
  borders?: object;
  shadows?: object;
}
\`\`\`

### Department Integration
- Forms automatically inherit department colors
- Department-specific branding elements
- Custom styling per department

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
}
\`\`\`

## Examples

### 1. Print Checklist Template
\`\`\`typescript
const printChecklistTemplate = {
  name: "Print Quality Checklist",
  type: "CHECKLIST",
  departmentId: "print-dept-id",
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

### 2. Project Specification Form
\`\`\`typescript
const projectSpecTemplate = {
  name: "Project Specifications",
  type: "FORM",
  schema: {
    fields: [
      {
        id: "projectType",
        type: "SELECT",
        label: "Project Type",
        required: true,
        options: ["Vehicle Wrap", "Signage", "Print"]
      },
      {
        id: "dimensions",
        type: "CUSTOM",
        label: "Dimensions",
        validation: {
          required: true,
          custom: (value) => validateDimensions(value)
        }
      }
    ]
  }
}
\`\`\`

### API Usage

#### Creating a Template
\`\`\`typescript
const response = await fetch('/api/forms/templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(template)
});
\`\`\`

#### Updating a Template
\`\`\`typescript
const response = await fetch(\`/api/forms/templates/\${templateId}\`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(updates)
});
\`\`\`

#### Getting Templates
\`\`\`typescript
// Get all templates
const response = await fetch('/api/forms/templates');

// Get templates by department
const response = await fetch('/api/forms/templates?departmentId=dept-id');

// Get templates by phase
const response = await fetch('/api/forms/templates?phaseId=phase-id');
\`\`\` 