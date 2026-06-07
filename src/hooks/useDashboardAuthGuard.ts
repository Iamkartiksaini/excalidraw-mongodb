"use client";

import { useUser } from "@clerk/nextjs";

/**
 * Encapsulates Clerk auth state for the dashboard.
 *
 * Returns:
 *  - isLoaded:      true once Clerk has resolved auth state (may still be signed-out)
 *  - isSignedIn:    true if the user is authenticated
 *  - showCloudTabs: true when the user is both loaded and signed in
 */
export function useDashboardAuthGuard() {
  const { isLoaded, isSignedIn } = useUser();

  return {
    isLoaded: !!isLoaded,
    isSignedIn: !!isSignedIn,
    showCloudTabs: !!isLoaded && !!isSignedIn,
  };
}
