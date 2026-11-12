import { useEffect, useRef } from "react";

import { OceanEngine } from "../../onboarding/ocean/engine";

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

    return () => engine.destroy();
  }, [theme]);

  return (
    <div className="home-hero-ocean">
      <canvas ref={canvasRef} className="ocean-canvas" aria-hidden="true" />
    </div>
  );
}
