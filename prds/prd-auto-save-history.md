# Product Requirement Document (PRD)
## Automatic Shared Access History Tracking (Auto-Save Shared Notes)

---

## 📌 Problem Statement

Currently, when users are sent shared notes (either public notes via a share link or restricted notes explicitly shared with them), they must manually click a "Save Link" button to bookmark and list them in their dashboard’s "Shared with me" tab. 

This manual requirement creates high user friction. Users frequently forget to save links, leading to lost shared documents, and making it extremely difficult to return to previously accessed notes.

---

## 🎯 Solution

Introduce **Automatic Shared Access History Tracking** (Auto-Saving Shared Notes). Whenever an authenticated (logged-in) user successfully accesses:
1. A **Public Note** (via its public sharing URL `/share/note/[shareId]`)
2. A **Restricted Shared Note** (which they have been explicitly invited to view)

The system will automatically record their access in the database by appending their Clerk `userId` to the note's `savedBy` array. This ensures that the note immediately and seamlessly appears in their "Shared with me" tab on the dashboard, creating an automatic access history without requiring any manual user action.

---

## 👥 User Stories

1. As a logged-in user, when I access a shared public note via its link, I want the note to be automatically saved to my dashboard, so that I don't have to manually click a save button.
2. As a logged-in user, when I open a restricted note shared with my email, I want it to automatically show up in my "Shared with me" list, so that I have a convenient history of all files shared with me.
3. As a note owner, when I view my own public or shared note, I do NOT want it to be added to my "Shared with me" list, so that my dashboard stays clean and uncluttered.
4. As a logged-in user, if I manually remove (unsave) a note from my dashboard, I want it to disappear, but if I revisit the URL later, I want it to be re-added to my history (acting like a web browser history).

---

## 🛠️ Implementation Decisions

### 1. In-Query Backend Auto-Save (The "Shared History" Model)
* **Decision**: Auto-saving will occur automatically within the read server actions: `getNoteById(id)` and `getPublicNote(shareId)`.
* **Rationale**: This guarantees **absolute security** with **zero client overhead**. Since the auto-save code is placed after permission checks have succeeded on the backend, unauthorized users can never trigger a write operation. It also avoids extra HTTP requests or client-side side-effect timers.
* **Exclusions**: Auto-save only triggers if:
  1. The user is logged in (Clerk `userId` is present).
  2. The user is NOT the owner of the note (`userId !== note.userId`).
* **Implementation Pattern**:
  ```typescript
  if (userId && note.userId !== userId) {
    await Note.findByIdAndUpdate(note._id, { $addToSet: { savedBy: userId } });
  }
  ```

### 2. Database Model Scopes
* The Mongoose schemas (`Note` and `NoteFolder`) already support the `savedBy` field, which is an array of strings (representing user IDs).
* When registering access, the user ID will be appended to `savedBy` using `$addToSet` in MongoDB to prevent duplicate entries and maintain idempotency.

### 3. Shared Tab Query Mechanics
* The `getSharedWithMeNotes` action will fetch all notes where the user’s email is in `invitedEmails` OR where the user's ID exists in `savedBy` (and `visibility` is not private).
* The dashboard client UI displays these notes with complete details (shareId, title, dates, and owner info) and provides actions to Unsave (delete from history), Clone to Cloud, or Save to Local.

---

## 🧪 Testing Decisions

### 1. Access Registration Tests
* **Test Case**: Assert that calling a read action with an unauthenticated session does NOT modify `savedBy`.
* **Test Case**: Assert that calling a read action as the owner of the note does NOT add the owner's ID to `savedBy`.
* **Test Case**: Assert that a logged-in non-owner successfully adds their `userId` to `savedBy` when successfully querying a public or restricted note.
* **Test Case**: Assert that accessing an unauthorized private note throws an error and does NOT add the caller to `savedBy`.

---

## 🚫 Out of Scope

* **Anonymous History**: Tracking shared history for guests/unlogged users using cookies or localStorage is out of scope. Guest history only saves notes created locally.
* **Clear History Button**: A general "Clear Shared History" button to wipe out all saved links is out of scope. Users can still manually click "Unsave" to remove individual notes from their dashboard.
* **Folder-Level Auto-Bookmark**: Automatically bookmarking a folder on viewing one of its child notes. Only the accessed note itself is bookmarked.
