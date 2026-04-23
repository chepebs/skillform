/**
 * Site-wide atmospheric background — soft red + teal radial gradients.
 * Mounted once at the app root, sits behind everything.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 15% 10%, hsl(var(--primary) / 0.08) 0%, transparent 60%)," +
          "radial-gradient(ellipse 60% 40% at 85% 85%, hsl(var(--secondary) / 0.06) 0%, transparent 60%)," +
          "radial-gradient(ellipse 100% 60% at 50% 50%, hsl(var(--primary) / 0.025) 0%, transparent 70%)",
      }}
    />
  );
}
