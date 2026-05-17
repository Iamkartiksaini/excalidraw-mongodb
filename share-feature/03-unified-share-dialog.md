## What to build

Build the new Share Dialog component. Implement `updateVisibility` and `inviteEmail` server actions. Integrate the Clerk session check to match logged-in emails against `invitedEmails`.

## Acceptance criteria

- [x] Unified Share Dialog component created with tabs for Public, Private, and Invite
- [x] Server action `updateVisibility` working for both notes and folders
- [x] Server action to add/remove specific emails from `invitedEmails` working
- [x] Authentication check successfully extracts user email from Clerk and validates against `invitedEmails`

## Blocked by

- 02-strict-folder-access-control.md

## Status
Completed

## Progress Summary
| Date | Status | Notes |
|---|---|---|
| 2026-05-17 | Completed | Unified Share Dialog, sharing server actions, dynamic UI states, and folder-supremacy Clone & Share implemented successfully. |
