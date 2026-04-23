import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface RailItem {
  id: string;
  label: string;
}

interface SectionRailProps {
  items: RailItem[];
}

/**
 * Right-side fixed vertical dot rail (desktop only) plus
 * a bottom-left mono "// section name //" indicator. Tracks
 * the section currently in view via IntersectionObserver.
 */
export function SectionRail({ items }: SectionRailProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');

  useEffect(() => {
    const targets = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el !== null);

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Choose the entry closest to the top of the viewport
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.25, 0.5, 1] },
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [items]);

  const activeLabel = items.find((it) => it.id === activeId)?.label ?? items[0]?.label ?? '';

  return (
    <>
      {/* Right-side vertical dot rail (lg+ only) */}
      <nav
        aria-label="Section navigation"
        className="hidden lg:flex fixed top-1/2 right-6 -translate-y-1/2 z-30 flex-col items-center gap-4"
      >
        {items.map((it) => {
          const active = it.id === activeId;
          return (
            <a
              key={it.id}
              href={`#${it.id}`}
              aria-label={it.label}
              aria-current={active ? 'true' : undefined}
              className="group relative flex items-center"
            >
              <span
                className={cn(
                  'block rounded-full transition-all duration-300',
                  active
                    ? 'w-2.5 h-2.5 bg-primary shadow-signal'
                    : 'w-1.5 h-1.5 bg-border group-hover:bg-muted-foreground',
                )}
              />
              <span
                className={cn(
                  'pointer-events-none absolute right-5 px-2 py-1 rounded-md',
                  'text-mono text-[10px] uppercase tracking-wider whitespace-nowrap',
                  'bg-background/80 border border-border backdrop-blur-sm',
                  'opacity-0 group-hover:opacity-100 transition-opacity',
                  active && 'text-primary',
                )}
              >
                {it.label}
              </span>
            </a>
          );
        })}
      </nav>

      {/* Bottom-left section indicator (md+ only) */}
      <div
        className="hidden md:flex fixed bottom-6 left-6 z-30 items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background/70 backdrop-blur-sm"
        aria-live="polite"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          // {activeLabel} //
        </span>
      </div>
    </>
  );
}
