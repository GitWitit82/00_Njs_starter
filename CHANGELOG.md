# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Task assignment functionality with user picker
- Task status updates with optimistic UI
- Task comments and activity tracking system
- Activity feed with real-time updates
- Task details view with tabbed interface
- User avatars in activity feed
- Timestamp tracking for all activities
- Status change tracking with history
- Assignment change tracking with history
- Comment system with instant updates
- Project type-specific fields (e.g., VIN number for vehicle wraps)
- Enhanced project details view with progress tracking
- Real-time project progress calculation
- Phase-based task organization
- Project status badges with visual indicators
- Form status tracking system with history
- Batch operations for form instances
- Form dependency visualization with force-directed graph
- New navigation structure for Forms section
- Dedicated routes for Templates and Instances
- Status validation and transition rules
- Form completion requirements tracking
- Interactive form dependency graph with zoom controls

### Changed
- Updated task management interface with modern UI
- Enhanced activity tracking with detailed history
- Improved task status visualization
- Updated project creation workflow with type-specific validation
- Enhanced project details page with comprehensive progress tracking
- Improved project phase visualization
- Updated sidebar navigation to include Forms section with sub-items
- Enhanced form instance page with status management
- Improved form template creation workflow
- Reorganized forms routing structure

### Fixed
- Route parameter naming consistency
- Form instance creation during project initialization
- Status transition validation
- Navigation issues in sidebar
- Project details page synchronous data fetching
- Project type validation in creation form

## [1.0.0] - 2024-01-08

### Added
- Initial release with basic form management
- Form template creation and editing
- Form instance management
- Basic status tracking
- Project integration
- Workflow phase association

### Security
- Role-based access control
- Input validation
- XSS prevention
- CSRF protection 