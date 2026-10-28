import { useEffect, useLayoutEffect, useRef } from "react";

import type { SharkHero } from "./hero-roster";
import { OceanEngine, type GlassZone, type OceanFrame } from "./ocean/engine";
import type { SharkSpec } from "./ocean/world";

export function SharkOcean({
  heroes,
  onFrame,
  theme,
  glassZone,
  headerInset,
  footerInset,
}: {
  heroes: SharkHero[];
  onFrame: (frame: OceanFrame) => void;
  theme: "light" | "dark";
  glassZone: GlassZone | null;
  headerInset: number;
  footerInset: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blurCanvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<OceanEngine | null>(null);
  const onFrameRef = useRef(onFrame);
  const themeRef = useRef(theme);
  const glassZoneRef = useRef(glassZone);
  const headerInsetRef = useRef(headerInset);
  const footerInsetRef = useRef(footerInset);

  useLayoutEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useLayoutEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useLayoutEffect(() => {
    glassZoneRef.current = glassZone;
    engineRef.current?.setGlassZones(glassZone ? [glassZone] : []);
  }, [glassZone]);

  useLayoutEffect(() => {
    headerInsetRef.current = headerInset;
    engineRef.current?.setHeaderInset(headerInset);
  }, [headerInset]);

  useLayoutEffect(() => {
    footerInsetRef.current = footerInset;
    engineRef.current?.setFooterInset(footerInset);
  }, [footerInset]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const blurCanvas = blurCanvasRef.current;
    if (!canvas || !blurCanvas) return;

    const updateClip = () => {
      if (!glassZone) {
        blurCanvas.style.clipPath = "inset(50% 50% 50% 50%)";
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const right = Math.max(0, rect.width - glassZone.x - glassZone.width);
      const bottom = Math.max(0, rect.height - glassZone.y - glassZone.height);
      blurCanvas.style.clipPath = `inset(${glassZone.y}px ${right}px ${bottom}px ${glassZone.x}px round ${glassZone.radius ?? 0}px)`;
    };

    updateClip();
    const observer = new ResizeObserver(updateClip);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [glassZone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sharks: SharkSpec[] = heroes.map(({ kind, size }) => ({ kind, size }));
    const engine = new OceanEngine(
      canvas,
      sharks,
      (frame) => onFrameRef.current(frame),
      themeRef.current,
      blurCanvasRef.current,
    );
    engineRef.current = engine;
    engine.setGlassZones(glassZoneRef.current ? [glassZoneRef.current] : []);
    engine.setHeaderInset(headerInsetRef.current);
    engine.setFooterInset(footerInsetRef.current);

    return () => {
      engineRef.current = null;
      engine.destroy();
    };
  }, [heroes]);

  useEffect(() => {
    engineRef.current?.setTheme(theme);
  }, [theme]);

  return (
    <>
      <canvas ref={canvasRef} className="ocean-canvas" aria-hidden="true" />
      <canvas ref={blurCanvasRef} className="ocean-blur-canvas" aria-hidden="true" />
    </>
  );
}
