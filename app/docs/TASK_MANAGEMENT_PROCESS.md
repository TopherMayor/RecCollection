# Task Management Process

This document outlines the process for managing tasks in the RecCollection project. It provides guidance on how to use the Task Management Protocol and associated templates.

## Overview

The RecCollection project uses a centralized task management system documented in `TASK_MANAGEMENT_PROTOCOL.md`. This system ensures continuity between different AI agents working on the project and provides a clear record of progress for the user.

## Process Flow

1. **Start of Session**:
   - Review the `TASK_MANAGEMENT_PROTOCOL.md` document
   - Identify the current state of the project
   - Determine which tasks to work on based on priority and dependencies

2. **During Session**:
   - Work on tasks according to their priority
   - Keep track of progress, challenges, and decisions
   - Identify new tasks as they emerge

3. **End of Session**:
   - Update the `TASK_MANAGEMENT_PROTOCOL.md` document
   - Use the `TASK_UPDATE_TEMPLATE.md` for guidance
   - Commit the updated document

## Updating Tasks

### Existing Tasks

When updating an existing task:

1. Update the task's state (e.g., from TODO to IN_PROGRESS or IN_PROGRESS to DONE)
2. Update the "Updated" date
3. Add notes about progress, challenges, or implementation details
4. If the task is complete, move it to the "Recently Completed Tasks" section
5. If the task is blocked, update its state to BLOCKED and note the reason

### Creating New Tasks

When creating a new task:

1. Use the `TASK_CREATION_TEMPLATE.md` for guidance
2. Assign the next available task ID (e.g., TASK-014 if TASK-013 is the highest existing ID)
3. Add the task to the appropriate feature section in the Task Registry
4. Set the initial state (usually BACKLOG or TODO)
5. Set the priority based on importance and urgency
6. Add any dependencies on other tasks

## Maintaining the Current Task Status Section

The "Current Task Status" section provides a snapshot of the project's current state. After each session:

1. Update the "Last Updated" date
2. Update the lists of recently completed, in-progress, and next-up tasks
3. Update the known issues list if applicable

## Updating the Project Roadmap

The Project Roadmap should be reviewed periodically and updated when:

1. Short-term goals have been completed
2. Medium or long-term priorities have changed
3. New features or requirements have been identified

## Best Practices

1. **Be Specific**: Provide detailed descriptions and notes
2. **Track Dependencies**: Clearly identify task dependencies
3. **Prioritize Appropriately**: Use the priority levels consistently
4. **Document Decisions**: Record important decisions in task notes
5. **Keep It Current**: Update the protocol at the end of each session

## Example Workflow

1. AI Agent reviews `TASK_MANAGEMENT_PROTOCOL.md`
2. Agent identifies TASK-010 (Mobile Responsiveness) as IN_PROGRESS and high priority
3. Agent works on implementing responsive design for specific pages
4. Agent identifies a new task: "Add responsive navigation menu"
5. At the end of the session, agent:
   - Updates TASK-010 with progress notes
   - Creates a new task for the responsive navigation menu
   - Updates the Current Task Status section
   - Commits the updated `TASK_MANAGEMENT_PROTOCOL.md`

## Handoff Between Agents

When handing off work between AI agents:

1. Clearly document the current state of all in-progress tasks
2. Note any challenges or blockers encountered
3. Suggest next steps for each in-progress task
4. Update the Current Task Status section to reflect the latest state
5. Commit all changes to the task management documents
