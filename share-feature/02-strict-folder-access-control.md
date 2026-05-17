## What to build

Update the schema with `visibility`, `invitedEmails`, and `folderId`. Rewrite `getNoteById` to enforce strict folder supremacy. Add server-side blocks for unauthorized access.

## Acceptance criteria

- [x] `Note` schema updated with `visibility`, `invitedEmails`, and `folderId`
- [x] `NoteFolder` schema updated with `visibility`, `invitedEmails`
- [x] `getNoteById` rewritten to prioritize folder settings over note settings when `folderId` is present
- [x] Unauthorized users attempting to access a restricted note or folder receive an "Unauthorized" error

## Blocked by

- 01-basic-folder-creation.md

## Status
Completed

## Progress Summary
| Date | Status | Notes |
|---|---|---|
| 2026-05-17 | Completed | Strictly enforced folder access control and schema updates implemented successfully |
