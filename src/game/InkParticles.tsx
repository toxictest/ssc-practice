import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface ParticleHandle {
  burst: (x: number, y: number, color: string, count?: number) => void;
  rain: (color: string, count?: number) => void;
}

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  c: string;
  g: number;
  spin: number;
  rot: number;
  shape: 0 | 1;
}

/**
 * Hand-written canvas ink-splatter layer. Particles are irregular ink blots
 * with gravity, drag and soft fade — a rubber stamp hitting paper, not arcade
 * confetti. Capped at 320 live particles so it stays cheap on mobile.
 */
const InkParticles = forwardRef<ParticleHandle, { className?: string }>(function InkParticles(
  { className },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const parts = useRef<P[]>([]);
  const raf = useRef<number>(0);

  useImperativeHandle(ref, () => ({
    burst(x, y, color, count = 26) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 9;
        parts.current.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - Math.random() * 3,
          life: 0,
          max: 55 + Math.random() * 45,
          r: 1.5 + Math.random() * 6,
          c: color,
          g: 0.16 + Math.random() * 0.16,
          spin: (Math.random() - 0.5) * 0.3,
          rot: Math.random() * Math.PI,
          shape: Math.random() > 0.65 ? 1 : 0,
        });
      }
      if (parts.current.length > 320) parts.current.splice(0, parts.current.length - 320);
    },
    rain(color, count = 34) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const w = window.innerWidth;
      for (let i = 0; i < count; i++) {
        parts.current.push({
          x: Math.random() * w,
          y: -20 - Math.random() * 200,
          vx: (Math.random() - 0.5) * 1.2,
          vy: 1 + Math.random() * 3,
          life: 0,
          max: 160 + Math.random() * 120,
          r: 1.5 + Math.random() * 3.5,
          c: color,
          g: 0.012,
          spin: (Math.random() - 0.5) * 0.12,
          rot: Math.random() * Math.PI,
          shape: 0,
        });
      }
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      raf.current = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const arr = parts.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        p.life++;
        p.vy += p.g;
        p.vx *= 0.985;
        p.vy *= 0.992;
        p.x += p.vx * dpr;
        p.y += p.vy * dpr;
        p.rot += p.spin;
        const t = p.life / p.max;
        if (t >= 1) {
          arr.splice(i, 1);
          continue;
        }
        const alpha = t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88;
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha) * 0.92;
        ctx.fillStyle = p.c;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.shape === 1) {
          ctx.fillRect(-p.r * dpr, -p.r * 0.35 * dpr, p.r * 2 * dpr, p.r * 0.7 * dpr);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r * dpr * (1 - t * 0.35), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    };

    if (!reduced) loop();
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
});

export default InkParticles;
