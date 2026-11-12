import { useEffect, useRef } from "react";

import { OceanEngine } from "../../onboarding/ocean/engine";

/** Chrome that should swallow a press instead of rippling the water. */
const QUIET =
  "button, a, input, textarea, select, label, [role='menu'], [role='menuitemradio'], .home-composer, .home-topbar, .home-status, .home-sidebar";

/**
 * The onboarding ocean, reused as the home backdrop: the same schooling
 * species on a transparent canvas, with no sharks — home has no cast.
 * The engine is rebuilt on a theme change because its ink is set up front.
 */
export default function HomeOcean({ theme }: { theme: "light" | "dark" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new OceanEngine(canvas, [], undefined, theme, null);

    // The canvas is `pointer-events: none`, so a press on the water reaches the
    // page instead of the engine; forward the ones that are not chrome.
    function onPointerDown(event: PointerEvent) {
      if (event.button !== 0) return;
      const target = event.target as Element | null;
      if (target?.closest?.(QUIET)) return;
      engine.splashAtClient(event.clientX, event.clientY);
    }

    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      engine.destroy();
    };
  }, [theme]);

  return (
    <div className="home-hero-ocean">
      <canvas ref={canvasRef} className="ocean-canvas" aria-hidden="true" />
    </div>
  );
}
