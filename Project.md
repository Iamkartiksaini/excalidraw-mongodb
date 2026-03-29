Build a full-stack web application using **Next.js (App Router)**, **MongoDB with Mongoose**, **Clerk authentication**, and the official **@excalidraw/excalidraw** library.

---

# 🎯 Objective

Create a production-ready drawing app by integrating the **actual Excalidraw component** and extending it with:

* Persistent storage using MongoDB (via Mongoose)
* User authentication via Clerk
* Manual save system
* Shareable public links
* Export functionality (PNG & SVG)

---

# 📦 Core Library Requirement

Use:

* `@excalidraw/excalidraw` (official package)

DO NOT recreate canvas logic manually.

---

# 🧱 Tech Stack

* Next.js (App Router + TypeScript)
* Tailwind CSS (v4)
* MongoDB + Mongoose (Singleton Pattern)
* Clerk Auth (Middleware protected)
* Lucide React (Icons)
* Zod (Schema Validation)
* Nanoid (Shareable IDs)

---

# 🔐 Authentication Logic

## Guest Users

* Can use Excalidraw freely
* Data stored in localStorage
* No database persistence
* No dashboard access

## Authenticated Users

* Can create, save, update, delete drawings
* Data stored in MongoDB
* Access dashboard
* Can generate shareable links

---

# 📄 Application Pages

## 1. Home (`/`)

* Buttons:

  * “Start Drawing” → `/draw/new`
  * “Login” (Clerk)

---

## 2. Dashboard (`/dashboard`) [Protected]

* Fetch drawings from MongoDB
* Display list/grid:

  * Title
  * Last updated
* Actions:

  * Open
  * Delete
* Button:

  * “New Drawing”

---

## 3. New Drawing (`/draw/new`)

* If authenticated:

  * Create new DB entry via API
  * Redirect to `/draw/[id]`
* If guest:

  * Open blank Excalidraw
  * Store in localStorage

---

## 4. Drawing Page (`/draw/[id]`)

## 🚨 IMPORTANT: Excalidraw Integration

* Dynamically import Excalidraw:

  * Disable SSR (`ssr: false`)
* Use:

  * `initialData` to hydrate canvas
  * `onChange` to track updates

---

## 🧠 Editor Features

### State to Track

* elements
* appState
* files (if needed)
* unsavedChanges (boolean)

---

## 💾 Manual Save System (CRITICAL)

### Save Button

* Present in top bar
* No autosave

### On Save

* Call PUT `/api/drawings/[id]`
* Send:

  * elements
  * appState

### Backend Logic

* Increment version
* Push previous state into `versions` array (limited to last 10-20 to save space)
* Update main document
* Validate payload using **Zod**

---

## 💾 MongoDB Schema (Mongoose)

### Drawing Model

* title: string
* userId: string (Clerk ID)
* elements: array
* appState: object
* version: number
* versions: [
  {
  elements: array,
  appState: object,
  version: number,
  createdAt: Date
  }
  ]
* isPublic: boolean (default: false)
* shareId: string (unique)
* createdAt
* updatedAt

---

# 🔌 API Routes (Serverless)

## POST `/api/drawings`

* Create new drawing

## GET `/api/drawings`

* Get all drawings for logged-in user

## GET `/api/drawings/[id]`

* Get single drawing (owner only)

## PUT `/api/drawings/[id]`

* Save drawing (manual save)
* Handle versioning

## DELETE `/api/drawings/[id]`

* Delete drawing

---

# 🌍 Shareable Links

## Share Button Logic

* Generate unique `shareId` (uuid)
* Set `isPublic = true`
* Return URL:

  * `/share/[shareId]`

---

## Public API

GET `/api/public/[shareId]`

* Return drawing if public

---

## Public Page `/share/[shareId]`

* Render Excalidraw in read-only mode
* Disable editing tools
* Hide save button

---

# 📤 Export Feature (MANDATORY)

Use Excalidraw utilities:

* `exportToCanvas`
* `exportToSvg`

### Buttons

* Export PNG
* Export SVG

### Behavior

* Convert current elements → file
* Trigger download

---

# 🧠 State Handling

* Use React state or Zustand
* Track unsaved changes
* Update state via `onChange` from Excalidraw

---

# ⚙️ Performance & Compatibility

* **Dynamic Import:** `@excalidraw/excalidraw` must be imported with `ssr: false`.
* **React 19 Note:** Monitor compatibility with React 19 (latest Excalidraw versions might need specific fixes or Canary builds).
* **MongoDB:** Singleton pattern to prevent multiple connections in dev mode.
* **Debounced Save:** (Optional) Consider debouncing local state, but keeping manual save as the primary persistence mechanism.

---

# 🔐 Security

* Use Clerk middleware for protected routes
* Ensure user can only access their own drawings

---

# 🎨 UI Requirements

* Minimal, clean UI (Excalidraw style)
* Top bar:

  * Save button
  * Export buttons
  * Share button
* Responsive layout

---

# 📦 Deliverables

* Complete working Next.js project
* Proper folder structure (App Router)
* Mongoose models
* API route handlers
* Clerk integration
* Excalidraw integration (correct usage)
* Manual save logic
* Versioning system
* Shareable links
* Export PNG/SVG

---

# 🚀 Output Format

* Provide full codebase
* File-by-file implementation
* Include setup instructions:

  * MongoDB connection
  * Clerk keys
  * Running locally
