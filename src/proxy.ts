import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only protect dashboard + authenticated API routes
// /draw (guest), /draw/[id] (owner-checked at action level), /share/[shareId] are public
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/drawings(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
