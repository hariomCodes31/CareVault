import { useEffect, useRef } from 'react';
import './CursorBackground.css';

/**
 * CursorBackground component:
 * - Very subtle, minimal, aesthetic ambient glow that follows the mouse with smooth, delayed movement.
 * - Positioned strictly BEHIND all text, images, cards, and content (z-index: 0).
 * - Never overlaps or interferes with readability.
 * - Uses CareVault palette: soft sage green, muted gold, and very light blue.
 * - Low opacity, soft radial blur, and 100% non-blocking (pointer-events: none).
 */
export default function CursorBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with smooth delayed tracking
    const mouse = {
      targetX: width * 0.5,
      targetY: height * 0.45,
    };

    // Smooth delayed ambient orbs
    const orbs = {
      sage: { x: width * 0.5, y: height * 0.45, lerp: 0.045, radius: 460 },
      gold: { x: width * 0.5, y: height * 0.45, lerp: 0.03, radius: 380 },
      blue: { x: width * 0.5, y: height * 0.45, lerp: 0.02, radius: 320 },
    };

    // Very subtle, minimal ambient bokeh points (only 16 soft blurred spots in background)
    const BOKEH_COUNT = 16;
    const bokehColors = [
      { r: 88, g: 128, b: 101 },  // Soft sage green
      { r: 192, g: 161, b: 92 },  // Muted gold
      { r: 70, g: 130, b: 210 },  // Very light blue
      { r: 120, g: 165, b: 140 }, // Light sage
    ];

    let bokehNodes = [];

    const initBokeh = () => {
      bokehNodes = [];
      for (let i = 0; i < BOKEH_COUNT; i++) {
        const homeX = Math.random() * width;
        const homeY = Math.random() * height;
        const color = bokehColors[i % bokehColors.length];

        bokehNodes.push({
          homeX,
          homeY,
          x: homeX,
          y: homeY,
          vx: 0,
          vy: 0,
          radius: Math.random() * 14 + 10, // 10px - 24px blurred radius
          alpha: Math.random() * 0.05 + 0.04, // Very subtle, low opacity (0.04 - 0.09)
          color,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.004 + 0.002,
          ampX: Math.random() * 24 + 12,
          ampY: Math.random() * 20 + 10,
        });
      }
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initBokeh();
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    };

    initBokeh();
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    let animationId;

    // ── Smooth Animation Loop ──
    const render = () => {
      // 1. Update smooth delayed orbs (graceful trailing inertia)
      orbs.sage.x += (mouse.targetX - orbs.sage.x) * orbs.sage.lerp;
      orbs.sage.y += (mouse.targetY - orbs.sage.y) * orbs.sage.lerp;

      orbs.gold.x += (mouse.targetX - orbs.gold.x) * orbs.gold.lerp;
      orbs.gold.y += (mouse.targetY - orbs.gold.y) * orbs.gold.lerp;

      orbs.blue.x += (mouse.targetX - orbs.blue.x) * orbs.blue.lerp;
      orbs.blue.y += (mouse.targetY - orbs.blue.y) * orbs.blue.lerp;

      // 2. Clear canvas to transparent so underlying page ivory shines through
      ctx.clearRect(0, 0, width, height);

      // 3. Draw Soft Blurred Ambient Light Clouds
      // Primary Orb — Soft Sage Green
      const sageGrad = ctx.createRadialGradient(
        orbs.sage.x,
        orbs.sage.y,
        0,
        orbs.sage.x,
        orbs.sage.y,
        orbs.sage.radius
      );
      sageGrad.addColorStop(0, 'rgba(88, 128, 101, 0.08)');
      sageGrad.addColorStop(0.45, 'rgba(88, 128, 101, 0.035)');
      sageGrad.addColorStop(0.75, 'rgba(88, 128, 101, 0.01)');
      sageGrad.addColorStop(1, 'rgba(250, 248, 245, 0)');
      ctx.fillStyle = sageGrad;
      ctx.beginPath();
      ctx.arc(orbs.sage.x, orbs.sage.y, orbs.sage.radius, 0, Math.PI * 2);
      ctx.fill();

      // Secondary Orb — Muted Gold (Warm ambient depth)
      const goldGrad = ctx.createRadialGradient(
        orbs.gold.x,
        orbs.gold.y,
        0,
        orbs.gold.x,
        orbs.gold.y,
        orbs.gold.radius
      );
      goldGrad.addColorStop(0, 'rgba(192, 161, 92, 0.065)');
      goldGrad.addColorStop(0.5, 'rgba(192, 161, 92, 0.025)');
      goldGrad.addColorStop(1, 'rgba(250, 248, 245, 0)');
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.arc(orbs.gold.x, orbs.gold.y, orbs.gold.radius, 0, Math.PI * 2);
      ctx.fill();

      // Tertiary Orb — Very Light Medical Blue (Soft trailing glow)
      const blueGrad = ctx.createRadialGradient(
        orbs.blue.x,
        orbs.blue.y,
        0,
        orbs.blue.x,
        orbs.blue.y,
        orbs.blue.radius
      );
      blueGrad.addColorStop(0, 'rgba(70, 130, 210, 0.045)');
      blueGrad.addColorStop(0.6, 'rgba(70, 130, 210, 0.015)');
      blueGrad.addColorStop(1, 'rgba(250, 248, 245, 0)');
      ctx.fillStyle = blueGrad;
      ctx.beginPath();
      ctx.arc(orbs.blue.x, orbs.blue.y, orbs.blue.radius, 0, Math.PI * 2);
      ctx.fill();

      // 4. Draw Soft Feathered Bokeh Light Points
      for (let i = 0; i < bokehNodes.length; i++) {
        const b = bokehNodes[i];

        // Harmonic floating orbit
        b.phase += b.speed;
        const currentHomeX = b.homeX + Math.cos(b.phase) * b.ampX;
        const currentHomeY = b.homeY + Math.sin(b.phase * 0.8) * b.ampY;

        // Gentle drift away from mouse cursor
        const dx = b.x - mouse.targetX;
        const dy = b.y - mouse.targetY;
        const dist = Math.hypot(dx, dy);

        let forceX = 0;
        let forceY = 0;
        if (dist < 180 && dist > 1) {
          const push = ((180 - dist) / 180) * 1.5;
          forceX = (dx / dist) * push;
          forceY = (dy / dist) * push;
        }

        forceX += (currentHomeX - b.x) * 0.015;
        forceY += (currentHomeY - b.y) * 0.015;

        b.vx = (b.vx + forceX) * 0.92;
        b.vy = (b.vy + forceY) * 0.92;
        b.x += b.vx;
        b.y += b.vy;

        // Render as feathered soft radial bokeh (no hard borders)
        const { r, g, b: bCol } = b.color;
        const bokehGrad = ctx.createRadialGradient(
          b.x,
          b.y,
          0,
          b.x,
          b.y,
          b.radius
        );
        bokehGrad.addColorStop(0, `rgba(${r}, ${g}, ${bCol}, ${b.alpha})`);
        bokehGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${bCol}, ${b.alpha * 0.4})`);
        bokehGrad.addColorStop(1, `rgba(${r}, ${g}, ${bCol}, 0)`);

        ctx.fillStyle = bokehGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="cursor-canvas-wrap" aria-hidden="true">
      <canvas ref={canvasRef} className="cursor-bg-canvas" />
    </div>
  );
}
