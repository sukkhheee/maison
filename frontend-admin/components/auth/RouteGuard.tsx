"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

/**
 * Wraps protected admin pages. While auth is being hydrated we render a
 * full-screen spinner; once we know there's no session we redirect to /login
 * and render nothing (prevents the dashboard flashing for unauthed visitors).
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="text-fg-muted animate-spin" size={28} />
      </div>
    );
  }

  if (status === "anonymous") return null;

  return <>{children}</>;
}
