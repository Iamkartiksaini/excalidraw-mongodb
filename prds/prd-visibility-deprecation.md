# Product Requirement Document (PRD)
## Strict Sharing Link Deprecation, Regenerate Link, and Dashboard UI Alignments

---

## 📌 Problem Statement

Currently, two major issues exist within the note sharing and dashboard UI:

1. **Security Vulnerability (Link Persistence)**: When a user changes a note's visibility from Public to Private or Restricted, the old public `shareId` remains unchanged in the database. If they change it back to Public later, or if a user has the old URL, there is no clean way to completely break/expire that previous URL. Transitioning visibility must permanently "deprecate" (invalidate) the old sharing links.
2. **Invite Link Accessibility**: When visibility is set to "restricted" (Invite), the `ShareDialog` does not display the sharing link. Invited users still require the share URL to access the note, making it impossible for owners to easily copy and distribute the URL to their invitees.
3. **Dashboard Tab Misalignment**: The dashboard tab buttons (Cloud Drawings, Local Drawings, Notes, Shared) have mismatched heights and misaligned items due to inconsistent flex layouts and vertical padding.

---

## 🎯 Solution

1. **Strict Link Deprecation**: 
   * Transitioning to `"private"` visibility will completely unset (`$unset`) the `shareId` field in Mongoose.
   * Transitioning to `"restricted"` or `"public"` visibility:
     * **Always generate a brand-new `shareId`** using `nanoid(10)` to immediately invalidate and deprecate any previous sharing link.
2. **Explicit Regenerate Link Feature (Rotate Link)**:
   * Provide a **"Regenerate Link"** button inside `ShareDialog` next to the copy input.
   * Clicking it triggers a dedicated server action `regenerateShareId` to force-rotate the `shareId` immediately, permanently deprecating the old URL.
3. **Friendly Deprecated Link Error**:
   * If a user tries to access a note using an expired/deleted `shareId`, the public read query `getPublicNote` will throw a highly descriptive and clear error:
     `"Note not found: it either does not exist, was deleted, or its visibility has changed."`
4. **Global Share Link Display**:
   * Render the shareable link and the regenerate button globally at the bottom of `ShareDialog` whenever visibility is Public or Invite.
   * Synchronize the `shareId` state locally within the dialog to support instantaneous UI updates on regeneration.
5. **Tabs Height Alignment**:
   * Align all `TabsTrigger` buttons on the dashboard using consistent Tailwind classes: `flex items-center justify-center gap-1.5 py-2 flex-1 px-6`.
   * Add `flex h-auto` to the parent `TabsList` component to keep all buttons perfectly aligned and equal in height.

---

## 👥 User Stories

1. As a note owner, when I toggle my note to private, I want any previous public link to be permanently broken, so that no one can ever access the document using that old link.
2. As a note owner, when I share a restricted note, I want to be able to copy its sharing link from the Invite settings tab, so that I can send it to my explicitly invited guests.
3. As a note owner, if I suspect a link has leaked, I want a "Regenerate" button to instantly change the URL and break the old link without having to make the note private.
4. As a visitor opening an expired or deleted link, I want to see a friendly error message informing me that the note does not exist, was deleted, or had its visibility changed.
5. As a dashboard user, I want the navigation tabs (Notes, Drawings, Shared) to look perfectly aligned, clean, and professional.

---

## 🛠️ Implementation Decisions

### 1. In-Query Deprecation in `updateVisibility`
* Update `updateVisibility` inside `src/actions/shareActions.ts`:
  * If `visibility === "private"`:
    ```typescript
    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { $set: { visibility, isPublic: false }, $unset: { shareId: "" } },
      { new: true }
    );
    ```
  * If `visibility === "public" || visibility === "restricted"`:
    - Always generate a brand-new `shareId = nanoid(10)` to immediately deprecate previous links.

### 2. New Server Action `regenerateShareId`
* Add a `regenerateShareId(id, type)` action in `src/actions/shareActions.ts`:
  * Validates ownership.
  * Generates a brand-new `shareId = nanoid(10)`.
  * Saves to database and returns the new value.

### 3. State-Synchronized `ShareDialog`
* Introduce `const [currentShareId, setCurrentShareId] = useState(shareId)` in `ShareDialog.tsx` to handle instant updates.
* Render the link copy and regenerate block globally below the `<Tabs>` component:
  ```typescript
  {visibility !== "private" && currentShareId && ( ... )}
  ```

### 4. Strict Editor Creator Restrictions
* Refactored `getNoteById` inside `src/actions/noteActions.ts` to strictly enforce owner-only checks (`note.userId === userId`).
* Prevented non-owners from loading the editor page (`/notes/[id]`) directly, forcing them to strictly use the shared reading page (`/share/note/[shareId]`).

---

## 🧪 Testing Decisions

* **Link Deprecation Test**: Assert that toggling a note's visibility to private successfully deletes the `shareId` field in Mongoose, and returning to public generates a new `shareId` different from the original one.
* **Layout Test**: Verify that the copy link block is rendered when clicking the "Invite" tab.
