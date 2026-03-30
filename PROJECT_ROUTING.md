# Project Routing Guide

This document provides an overview of the pages and routes within the Excali-Draw project, powered by MongoDB and Clerk.

## Pages

### [Home Page](/src/app/page.tsx)
- **Route:** `/`
- **Functionality:** The landing page of the application. It introduces users to the core features (Cloud Sync, Version History, Instant Sharing) and provides a clear call-to-action to start drawing or sign in.

### [Dashboard](/src/app/dashboard/page.tsx)
- **Route:** `/dashboard`
- **Functionality:** A protected route for authenticated users. It lists all drawings stored in the cloud (MongoDB) and allows users to manage their boards.

### [New Drawing Page](/src/app/draw/page.tsx)
- **Route:** `/draw`
- **Functionality:** A utility route that automatically generates a unique ID and redirects the user to a new local workspace.

### [Local Workspace](/src/app/draw/local/[id]/page.tsx)
- **Route:** `/draw/local/[id]`
- **Functionality:** A dedicated workspace for local or guest drawings. Changes are persisted in the browser's IndexedDB, ensuring work isn't lost during sessions.

### [Cloud Workspace](/src/app/draw/[id]/page.tsx)
- **Route:** `/draw/[id]`
- **Functionality:** The primary drawing area for authenticated users. Drawings are synced in real-time to MongoDB for persistent cloud storage and multi-device access.

### [Shared Drawing](/src/app/share/[shareId])
- **Route:** `/share/[shareId]`
- **Functionality:** Allows anyone with the unique link to view a shared drawing. Designed for collaboration and easy demonstration of concepts.

---

## API Routes

### [Drawings API](/src/app/api/drawings/route.ts)
- **Route:** `/api/drawings`
- **Functionality:** Provides the backend implementation for managing drawing data in MongoDB. Supports operations like fetching all user drawings, creating new ones, and deleting existing boards.

### [Public Share API](/src/app/api/public/[shareId]/route.ts)
- **Route:** `/api/public/[shareId]`
- **Functionality:** Fetches publicly shared drawing data. This allows non-authenticated users to view boards shared via a link.
