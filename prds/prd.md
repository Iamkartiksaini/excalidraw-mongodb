## Problem Statement

Currently, the application only supports binary visibility for notes and drawings: they are either completely private (only accessible to the creator) or completely public (accessible to anyone with the link). Users lack the ability to organize notes into folders and selectively share content with specific individuals. This limits secure collaboration for teams or small groups who need shared access to certain documents without exposing them to the entire internet.

## Solution

Introduce a granular access control system and a grouping mechanism for notes. The new sharing structure will support three levels of visibility:
1. **Public**: Accessible to anyone with the share link.
2. **Invited (Restricted)**: Accessible only to specific, explicitly invited users (based on their email).
3. **Private**: The default state, accessible only to the owner.

Additionally, the system will introduce "Folders" allowing users to organize multiple notes together and apply sharing rules to the entire folder at once.

## User Stories

1. As an author, I want to create a "Folder" of notes, so that I can organize related content together.
2. As an author, I want to invite specific users (by email) to view or edit my note, so that I can collaborate securely without making the note public.
3. As an author, I want to share an entire Folder with specific users, so that they automatically get access to all notes within that Folder.
4. As an author, I want to keep my note or Folder private by default, so that only I have access until I explicitly share it.
5. As an author, I want to make a note or Folder completely public, so that I can share it broadly via a link.
6. As an author, I want to manage the list of invited users (e.g., revoke access or change permissions), so that I retain control over my data.
7. As an invitee, I want to see a "Shared with me" tab in my dashboard, so that I can easily find notes and Folders that others have invited me to.
8. As a viewer of a public note or folder, I want to be able to "Save" it to my dashboard, so that I can easily find it again later without losing the link.
9. As an unauthenticated or unauthorized user, I want to be blocked from accessing a restricted note, so that the owner's privacy is maintained.
9. As an author, when I toggle a Folder's visibility to restricted, I want all notes within that Folder to implicitly inherit this restricted access, so that invited users can access the notes without me needing to share each one individually.
10. As an author, when I toggle a Folder's visibility to public, I want all notes within that Folder to become accessible to anyone with the link.
11. As an author, when I change a Folder's visibility back to private, I want all notes within that Folder to immediately lose their inherited shared access.

## Implementation Decisions

- **Domain Decision**: The concept of collecting notes together will be referred to as a "Folder" to avoid confusion with user "Groups" (Teams) in potential future features.

- **Schema Updates**:
  - Modify `Note` (and potentially `Drawing`): 
    - Replace/Augment `isPublic: Boolean` with `visibility: String` (`'private' | 'public' | 'restricted'`).
    - Add `invitedEmails: [String]` to store the email addresses of invited users.
    - Add `savedBy: [String]` (array of userIds) to track users who have manually saved a public note.
    - Add `folderId: ObjectId` (optional reference to a NoteFolder).
  - Create new `NoteFolder` model:
    - Fields: `title`, `userId` (owner), `visibility`, `invitedEmails`, `savedBy`, `shareId`.

- **API & Server Actions**:
  - Update `getNoteById` in `noteActions.ts` to implement strict hierarchical access: 
    1. If the note belongs to a `NoteFolder`, the folder's `visibility` and `invitedEmails` strictly override the note's individual settings. The note's individual settings are ignored.
    2. If the note does NOT belong to a folder, check the note's individual `visibility` and `invitedEmails`.
    3. UI Consideration: When a note is inside a folder, its individual sharing controls are overridden. The UI should instead offer a 'Clone and Share' option (see UI section).
  - Add actions: `inviteEmailToNote(noteId, email)`, `removeEmailFromNote(noteId, email)`, `updateNoteVisibility(noteId, visibility)`, and ensure a `cloneNote(noteId)` action exists to duplicate a note without its folder association.
  - Add a new `folderActions.ts` for CRUD operations on Folders and folder sharing toggles.
  - Create a `getSharedWithMeNotes()` action to populate the dashboard tab.

- **UI / Client-side Changes**:
  - Add a unified "Share" dialog component accessible from the Note Editor and Dashboard NoteCards.
  - The Share dialog will have tabs/options for: Public Link, Private, and Invite Users.
  - **Clone & Share Flow**: If a user opens the Share dialog for a note that is currently inside a Folder, the dialog will state that access is managed by the folder. It will provide a "Clone and Share" button, which duplicates the note (detached from the folder) and opens the sharing options for that new clone.
  - To invite users, the UI will require the exact email address of the invitee (no automated emails will be sent; authors must share the link manually).
  - Add a "Folders" section and a "Shared with me" section to the Dashboard sidebar/tabs.
  - Add a "Save to Dashboard" button on the public view (`/share/note/[id]`) so authenticated users can add public links to their "Shared with me" tab.

## Testing Decisions

- **Access Control Tests (Integration/Unit)**:
  - Test that `getNoteById` throws "Unauthorized" for a restricted note when the user is not in the `invitedUsers` list.
  - Test that `getNoteById` returns the note when the requesting user is in the `invitedUsers` list.
- **Folder Hierarchy Tests**:
  - Ensure that if a user has access to a Folder, they can read the notes inside it (cascading permissions).
- **UI Tests**:
  - Verify that the Share Dialog accurately reflects the current visibility state and invited users list.
- **Prior Art**: Base these authorization checks on the existing ownership checks (`note.userId !== userId && !note.isPublic`) in `noteActions.ts`.

## Out of Scope

- **Real-time multiplayer editing (CRDTs/Yjs)**: While users can share notes, simultaneous real-time editing with cursor tracking is out of scope for this specific access-control PRD.
- **Granular Folder Permissions**: For now, sharing a Folder gives access to *all* notes in the Folder. Excluding specific notes within a shared Folder is out of scope.

## Further Notes

- **Clerk Integration**: The Share UI will feature a form where the owner can input an invitee's exact email address. This email is saved directly into the `invitedEmails` array in the database. When a user attempts to access a restricted note or folder, the server action will retrieve the accessing user's email from their active Clerk session (e.g., via `currentUser().emailAddresses[0].emailAddress`). The system will then check if this email exists in the `invitedEmails` array. This flow relies on simple email matching rather than complex user search APIs, ensuring a streamlined and secure access check.
