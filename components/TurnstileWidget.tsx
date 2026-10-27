"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        callback?: (token: string) => void;
        "error-callback"?: () => void;
        "expired-callback"?: () => void;
      }) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

const activeWidgetIds = new Set<string>();

/**
 * Turnstile tokens are single-use. Call after every submit attempt so the
 * applicant gets a fresh token if they need to submit again.
 */
export function resetTurnstileWidgets(): void {
  if (typeof window === "undefined" || !window.turnstile) return;
  activeWidgetIds.forEach((id) => {
    try {
      window.turnstile?.reset(id);
    } catch {
      /* ignore */
    }
  });
}

interface TurnstileWidgetProps {
  onToken?: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

/**
 * Cloudflare Turnstile widget for spam protection.
 * Renders only when NEXT_PUBLIC_TURNSTILE_SITE_KEY is configured.
 * The widget automatically appends a hidden input named "turnstileToken" to the form.
 */
export function TurnstileWidget({ onToken, onError, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    // Load Turnstile script if not already loaded
    if (!document.getElementById("turnstile-script")) {
      const script = document.createElement("script");
      script.id = "turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Wait for Turnstile to be available
    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current || widgetIdRef.current) return;

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onToken,
          "error-callback": onError,
          "expired-callback": onExpire,
        });
        if (widgetIdRef.current) activeWidgetIds.add(widgetIdRef.current);
      } catch (error) {
        console.error("Failed to render Turnstile widget:", error);
      }
    };

    // If Turnstile is already loaded, render immediately
    if (window.turnstile) {
      renderWidget();
    } else {
      // Otherwise wait for it to load
      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          renderWidget();
        }
      }, 100);

      return () => {
        clearInterval(checkInterval);
        if (widgetIdRef.current && window.turnstile) {
          activeWidgetIds.delete(widgetIdRef.current);
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onToken, onError, onExpire]);

  // Don't render anything if Turnstile is not configured
  if (!siteKey) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <div ref={containerRef} />
    </div>
  );
}
