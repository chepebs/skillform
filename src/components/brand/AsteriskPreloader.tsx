import { useEffect, useState } from "react";

const MIN_DURATION = 700;

/**
 * Full-screen asterisk preloader shown on first mount.
 * Fades out after Promise.all([min 700ms, window 'load']).
 */
export function AsteriskPreloader() {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const minDelay = new Promise<void>((resolve) => {
      window.setTimeout(resolve, MIN_DURATION);
    });

    const loaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") {
        resolve();
      } else {
        window.addEventListener("load", () => resolve(), { once: true });
        // Fallback in case 'load' never fires (cached SPA)
        window.setTimeout(resolve, 2500);
      }
    });

    Promise.all([minDelay, loaded]).then(() => {
      if (cancelled) return;
      setFading(true);
      window.setTimeout(() => {
        if (!cancelled) setShow(false);
      }, 350);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-300"
      style={{ opacity: fading ? 0 : 1 }}
    >
      {/* Ambient glow behind the glyph */}
      <div
        className="pointer-events-none absolute h-[400px] w-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.18) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        <span className="preloader-asterisk select-none" aria-label="Skill form">
          *
        </span>

        <div className="flex items-center gap-3 text-mono uppercase tracking-[0.2em] text-muted-foreground">
          <span className="block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span>
            Skill<span className="text-primary">*</span>form
          </span>
          <span className="block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </div>
  );
}
