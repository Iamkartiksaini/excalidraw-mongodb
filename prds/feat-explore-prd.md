# PRD: Public Profiles, Explore, and Note Cloning

## Problem Statement

Currently, users can share their individual notes via a unique public sharing link (`/share/note/[shareId]`). However, there is no centralized way for users to discover other creators, browse their publicly shared notes, or easily search for profiles. Furthermore, if a user finds a valuable public note from another creator, they must manually copy-paste the content if they want to build upon it or save it in their own workspace. This limits community engagement, discoverability, and the collaborative potential of the platform.

## Solution

We will introduce three primary features to solve this problem:
1. **An `/explore` Route**: A dedicated search page containing a search input field and a "Search Profile" submit button.
   - When a username is searched, if the user is found, the page immediately redirects the viewer to their profile page `/[username]`.
   - If the user is not found, a toast notification is displayed: `"User [username] not found"`.
2. **A Public Profile Page (`/[username]`)**: A dynamic root-level route displaying the creator's profile picture, username, and their public notes list (initially 10).
3. **Public Note Cloning**: On a creator's public profile page or public note page, users can clone the public note with a single click:
   - **Clone to Cloud DB**: Saves a copy of the note to the authenticated user's MongoDB database.
   - **Clone to Local DB**: Saves a copy of the note to the user's browser-based IndexedDB storage (available to guest/unauthenticated users as well).

## User Stories

1. As a user, I want to navigate to an `/explore` page from the navigation bar, so that I can discover and search for other creators.
2. As a user, I want to search for profiles by typing a username, so that I can find specific creators I know or want to follow.
3. As a user, if a creator does not exist, I want to see a toast notification on the explore page saying `"User not found"`, so that I am informed of the typo or invalid username.
4. As a user, if the creator exists, I want to be redirected immediately to their profile page at `/[username]`, so that I can seamlessly view their notes.
5. As a visitor to a creator's profile page, I want to see their profile picture, username, and a list of up to 10 of their public notes, so that I can see what they've shared.
6. As a visitor, I want to click on any public note in the profile list, so that I can read the shared note in the read-only view.
7. As an authenticated user, I want to click a "Clone to Cloud" button on a public note, so that a copy of the note is immediately saved to my cloud dashboard, allowing me to edit it.
8. As a guest user, I want to click a "Clone Locally" button on a public note, so that a copy of the note is saved to my browser's IndexedDB, allowing me to edit it without signing in.
9. As a creator, I want only my public notes (those with `visibility: "public"` or `isPublic: true`) to be visible on my public profile page, so that my private and restricted notes remain confidential.

## Implementation Decisions

### Modules to Build / Modify

#### 1. Explore Page Route (`/explore`)
- **UI & Layout**: A minimal, beautiful page in the Virgil hand-drawn aesthetic containing:
  - A prominent search input field with a hand-drawn style boundary.
  - A stylized "Search Profile" submit button.
  - **Disabled State**: The submit button is disabled when the input field is empty (or loading).
- **Clerk Integration & Client Interactions**:
  - Leverages Clerk server SDK (`clerkClient`) via a Server Action, `getProfileByUsername(username: string)`.
  - **Submit Function Validation**: The first line of the form submit handler contains an explicit validation check: `if (!query.trim()) return;` to immediately guard against empty or whitespace-only submissions.
  - **Self-Search Redirection**: If a logged-in user searches for their own username, they are redirected to their `/[username]` public page to serve as a neat "public preview/dashboard" mode.
  - The Server Action maps the exact Clerk user (case-insensitively) and returns a lightweight public profile representation `{ id, username, imageUrl }`, hiding all other user details.
  - If found, the client-side component redirects to `/[username]`.
  - If not found, the client-side component triggers a toast message.

#### 2. Profile Page Route (`/[username]`)
- **Routing**: Dynamic root route `/[username]`. To prevent collisions, static system folders (`/dashboard`, `/draw`, `/notes`, `/share`, `/sign-in`, `/sign-up`, `/api`) take precedence via standard Next.js path matching.
- **User Lookup**:
  - A Server Action, `getProfileByUsername(username: string)`, will lookup the exact user in Clerk via `clerkClient.users.getUserList({ username: [username] })`.
  - If no user is found, displays a clean 404 page in Virgil style.
- **Notes Lookup**:
  - Fetches notes associated with the retrieved user ID that are publicly accessible, strictly respecting folder-level visibility overrides.
  - To do this safely:
    1. First, fetch all public folders for the creator: `NoteFolder.find({ userId: profileUserId, visibility: "public" }).select("_id")`.
    2. Query notes matching `{ userId: profileUserId }` where:
       - Either the note has no folder and `visibility === "public"`.
       - Or the note belongs to one of the public folder IDs.
  - Limits the query to 10 notes, sorted by `updatedAt` in descending order.
- **UI Components**:
  - Renders the creator's avatar, username, and a styled note grid.
  - Each note card displays the title, a text snippet (stripped of markdown), last updated date, and quick action buttons for "Clone to Cloud" and "Clone to Local".

#### 3. Public Note Cloning API / Server Action
- **Clone to Cloud**:
  - A Server Action, `clonePublicNoteToCloud(noteId: string)`, that connects to MongoDB, fetches the public note, verifies that it is public, and duplicates its title and content into a new note document owned by the active authenticated user (`userId` from `auth()`).
- **Clone to Local (IndexedDB)**:
  - Leverages the existing `saveGuestNote` client-side function to clone the public note's title and content into browser storage.

#### 4. Navigation Bar (`Navbar.tsx`)
- Adds an "Explore" link in the navbar, adjacent to "My Boards", using the Virgil hand-drawn styling and Lucide icons.

## Testing Decisions

### What Makes a Good Test
- **External Behavior Focus**: Tests will focus on verifying that endpoints and actions return correct data shapes, restrict private fields, enforce correct access rules, and perform correct database operations, without asserting on exact implementation details.

### Modules to Test
1. **`searchProfiles` Action**:
   - Verify it returns only `id`, `username`, and `imageUrl` and strips out all sensitive user data (emails, phone numbers, metadata).
   - Verify it handles empty or non-matching queries gracefully.
2. **`getProfileByUsername` and Notes Fetching**:
   - Verify it correctly fetches public notes for a user ID.
   - Verify it strictly excludes private or restricted notes from the public profile note list.
3. **`clonePublicNoteToCloud` Action**:
   - Verify that an authenticated user can clone a public note.
   - Verify that an unauthorized cloning attempt on a private or restricted note throws an "Unauthorized" error.

### Prior Art
- Access control tests will emulate the ownership and public checks currently used in `getNoteById` within `src/actions/noteActions.ts`.
- Guest storage interactions will align with local notes migration test patterns in `src/components/NoteCard.tsx` (`handleCloneToCloud` and `handleMoveToCloud`).

## Out of Scope

- **Real-time collaboration on cloned notes**: Once a note is cloned, it becomes a completely independent document owned by the cloner. Changes made to the clone do not reflect on the original note, and vice-versa. Yjs/CRDT multiplayer synchronization of clones is out of scope.
- **Following / Social Features**: Implementing a social graph (followers, following, activity feeds, liking notes) is out of scope for this initial profile discovery release.
- **Drawing Cloning**: This PRD focuses exclusively on cloning text/markdown **Notes**. Drawing/board cloning is out of scope.

## Further Notes

- **Clerk Username Requirement**: This feature relies on creators having a username configured in Clerk. If a user does not have a username, they will not be discoverable via explore or have a `/[username]` page. A fallback message will be displayed on the `/explore` page reminding users that only accounts with usernames set are visible.
