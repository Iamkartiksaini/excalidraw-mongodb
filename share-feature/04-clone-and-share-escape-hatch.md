## What to build

Update the Share Dialog to detect if a note has a `folderId`. If so, show the "Clone and Share" state. Implement the `cloneNote` server action (duplicating the note with `folderId = null`) and route the user to the new clone's share settings.

## Acceptance criteria

- [x] Share Dialog displays "Access managed by folder" message when a note is inside a folder
- [x] Share Dialog provides a "Clone and Share" button for nested notes
- [x] `cloneNote` server action correctly duplicates the note content but strips the `folderId`
- [x] User is redirected or presented with the Share Dialog for the newly created clone

## Blocked by

- 03-unified-share-dialog.md

## Status
Completed

## Progress Summary
| Date | Status | Notes |
|---|---|---|
| 2026-05-17 | Completed | "Clone & Share" escape hatch, server action, routing, and auto-open query parameters successfully implemented. |
