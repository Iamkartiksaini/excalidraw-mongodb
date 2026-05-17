## What to build

Add the `savedBy` array to the schema. Add a "Save to Dashboard" button on the public viewer page (`/share/note/[id]`). Update the "Shared with me" query to also pull items where the user's ID is in `savedBy`.

## Acceptance criteria

- [x] `Note` and `NoteFolder` schemas updated with `savedBy` [String] array
- [x] Public view page (`/share/note/[id]`) displays a "Save to Dashboard" button for authenticated users
- [x] Server action created to toggle a user's ID in the `savedBy` array
- [x] `getSharedWithMeNotes` updated to include notes/folders where the user's ID exists in `savedBy`

## Blocked by

- 05-shared-with-me-tab.md

## Status
Completed

## Progress Summary
| Date | Status | Notes |
|---|---|---|
| 2026-05-17 | Completed | savedBy schemas, public reader save links, toggleSavedPublicLink server action, and updated shared tab queries successfully implemented. |
