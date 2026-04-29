"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { socialLogin } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "./AuthProvider";

/**
 * Renders Google's official Sign-In button via Google Identity Services. The
 * GIS script tag is loaded in the root layout, so we just wait for
 * `window.google.accounts.id` to exist and call `renderButton`.
 *
 * On success, GIS hands us an ID token; we exchange it for our backend's JWT
 * via /auth/social-login, then store both in the auth context.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void;
          renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
        };
      };
    };
  }
}

type GoogleCredentialResponse = { credential: string };
type GoogleIdConfig = {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  ux_mode?: "popup" | "redirect";
};
type GoogleButtonOptions = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: number;
  locale?: string;
};

export function GoogleSignInButton({
  onSuccess,
  locale = "mn"
}: {
  onSuccess?: () => void;
  locale?: string;
}) {
  const { signIn } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [exchanging, setExchanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;
    let attempts = 0;

    // GIS script is loaded async; poll briefly for window.google.accounts.id.
    const tryRender = () => {
      if (cancelled) return;
      attempts += 1;
      const gid = window.google?.accounts?.id;
      if (!gid) {
        if (attempts < 50) setTimeout(tryRender, 100);
        return;
      }

      gid.initialize({
        client_id: clientId,
        ux_mode: "popup",
        callback: async (response) => {
          setError(null);
          setExchanging(true);
          try {
            const result = await socialLogin("google", response.credential);
            signIn(result.accessToken, result.user);
            onSuccess?.();
          } catch (e) {
            if (e instanceof ApiError) setError(e.message);
            else setError("Нэвтрэлт амжилтгүй боллоо.");
          } finally {
            setExchanging(false);
          }
        }
      });

      if (containerRef.current) {
        gid.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 320,
          locale
        });
      }
    };

    tryRender();
    return () => {
      cancelled = true;
    };
  }, [clientId, locale, onSuccess, signIn]);

  if (!clientId) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Google нэвтрэлт идэвхгүй байна. <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>{" "}
        тохируулна уу.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={containerRef} className="min-h-[44px]" />
      {exchanging && (
        <p className="text-sm text-ink/60 inline-flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" />
          Нэвтэрч байна…
        </p>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
