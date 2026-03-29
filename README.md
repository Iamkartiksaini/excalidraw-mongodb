# Excalidraw-MongoDB

A full-stack, authenticated whiteboarding application inspired by Excalidraw.

This project integrates the core `@excalidraw/excalidraw` package with a modern Next.js 16 application setup, providing users with a dedicated dashboard to manage their drawing boards, rename them, share them publicly, or delete them when they are no longer needed.

## Features

- **Whiteboarding**: Full integration with the official Excalidraw package for an authentic diagramming and sketching experience.
- **Authentication**: Secure user login and signup flows powered by [Clerk](https://clerk.com/).
- **Dashboard Management**:
  - View all your drawings as beautifully rendered cards.
  - Automatically formatted "Twitter-style" timestamps indicating active edits.
  - Options popover to easily rename or delete your boards.
- **Cloud Storage**: Persistent storage in MongoDB using Mongoose, automatically saving your `elements` and `appState`.
- **Sharing**: Toggling functionality to make your precise drawing public and generate a link to share with others.
- **Modern UI**: Styled efficiently via Tailwind CSS and Shadcn UI components. Flash messages handle real-time feedback with Sonner.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Whiteboard Engine**: `@excalidraw/excalidraw`
- **Styling**: Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: Lucide React & Remix Icon

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed. Check `.env.example` to see which environment variables need to be populated (MongoDB connection strings, Clerk API keys, etc).

1. Clone the repository and install dependencies:

```bash
npm install
```

1. Add your environment variables in `.env`:

```bash
cp .env.example .env
```

*(Fill out your credentials for MongoDB and Clerk)*

1. Run the development server:

```bash
npm run dev
```

1. Open [http://localhost:3000](http://localhost:3000) with your browser to launch the app!

## Project Structure

- `src/app/` - Next.js App Router providing routing for the Dashboard and Drawing canvases.
- `src/components/` - Reusable UI widgets, Shadcn dialogs, and wrapper logic for the Excalidraw instance.
- `src/actions/` - Server Actions processing drawing creations, updates, renames, and deletions natively on the server.
- `src/models/` - Mongoose database schemas.
