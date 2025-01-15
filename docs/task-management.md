# Task Management Guide

## Overview
The Task Management system provides comprehensive features for managing tasks within projects, including status updates, user assignments, and activity tracking. This guide covers all aspects of task management functionality.

## Features

### Task Status Management
- Real-time status updates with visual indicators
- Status options:
  - Not Started
  - In Progress
  - On Hold
  - Completed
- Optimistic UI updates for immediate feedback
- Activity tracking for status changes

### Task Assignment
- User assignment with searchable dropdown
- Quick unassignment option
- Visual indicators for assigned users
- Activity tracking for assignment changes
- Optimistic UI updates for immediate feedback

### Comments and Activity Tracking
- Real-time comment system
- Activity feed showing:
  - User comments
  - Status changes
  - Assignment changes
- Timestamp for each activity
- User avatars for visual identification
- Scrollable activity history

### Task Details View
- Tabbed interface for organized information:
  - Details tab: Task description and basic info
  - Activity tab: Comments and activity history
- Card-based layout for clear information hierarchy
- Integrated actions panel for quick updates

## Using the Task Management System

### Updating Task Status
1. Locate the status dropdown in the task actions bar
2. Click to open the status options
3. Select the new status
4. Status will update immediately with server confirmation
5. Activity feed will reflect the change

### Assigning Tasks
1. Find the assignment button in the task actions
2. Click to open the user selection dropdown
3. Search for users if needed
4. Select a user to assign
5. Use "Unassigned" option to remove assignment
6. Assignment will update immediately

### Adding Comments
1. Navigate to the Activity tab
2. Enter your comment in the text area
3. Click the send button or press Enter
4. Comment will appear in the activity feed
5. All task members will see the update

### Viewing Task History
1. Open the Activity tab
2. Scroll through the chronological feed
3. Each entry shows:
   - User who made the change
   - Type of activity
   - Timestamp
   - Relevant details

## Best Practices

### Status Updates
- Keep status current to reflect actual progress
- Use "On Hold" for blocked tasks
- Update status promptly when changes occur
- Add comments to explain significant status changes

### Task Assignment
- Assign tasks as soon as they're ready for work
- Reassign tasks when responsibilities change
- Consider workload when assigning tasks
- Use unassign feature for tasks pending assignment

### Comments
- Be clear and concise in comments
- Reference relevant information or decisions
- Use comments to explain blockers
- Document important task-related discussions

### Activity Tracking
- Review activity history before making changes
- Use activity feed to understand task context
- Monitor status changes for workflow optimization
- Track assignment patterns for resource management

## Technical Details

### API Endpoints

#### Update Task
```http
PATCH /api/projects/{projectId}/tasks/{taskId}
```
Supports:
- Status updates
- Assignment changes
- Comment addition

#### Get Task Details
```http
GET /api/projects/{projectId}/tasks/{taskId}
```
Returns:
- Task details
- Current status
- Assignment info
- Activity history

### Data Models

#### Task Activity Types
- `COMMENT`: User comments
- `STATUS_CHANGE`: Status updates
- `ASSIGNMENT`: Assignment changes

#### Status Types
- `NOT_STARTED`
- `IN_PROGRESS`
- `ON_HOLD`
- `COMPLETED`

## Troubleshooting

### Common Issues
1. **Status Not Updating**
   - Check internet connection
   - Verify user permissions
   - Refresh page if needed

2. **Assignment Changes Not Saving**
   - Confirm user exists
   - Check permissions
   - Try reassignment

3. **Comments Not Appearing**
   - Ensure comment isn't empty
   - Check connection
   - Refresh activity feed

### Getting Help
- Contact system administrator for technical issues
- Report bugs through appropriate channels
- Suggest improvements via feedback system 