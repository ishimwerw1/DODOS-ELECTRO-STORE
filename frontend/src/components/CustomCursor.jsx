import { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const [clicking, setClicking]   = useState(false);
  const [hovering, setHovering]   = useState(false);

  // Don't render on touch-only devices
  const isPointerFine = typeof window !== 'undefined'
    ? window.matchMedia('(pointer: fine)').matches
    : false;

  useEffect(() => {
    if (!isPointerFine) return;
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = -100, mouseY = -100;
    let ringX  = -100, ringY  = -100;
    let rafId;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(animate);
    };

    const onMouseDown = () => setClicking(true);
    const onMouseUp   = () => setClicking(false);

    const onMouseOver = (e) => {
      const el = e.target.closest(
        'a, button, [role="button"], label, select, input[type="checkbox"], input[type="radio"], input[type="submit"], input[type="button"], input[type="file"], [tabindex]'
      );
      setHovering(!!el);
    };

    document.addEventListener('mousemove',  onMove);
    document.addEventListener('mousedown',  onMouseDown);
    document.addEventListener('mouseup',    onMouseUp);
    document.addEventListener('mouseover',  onMouseOver);
    rafId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mousedown',  onMouseDown);
      document.removeEventListener('mouseup',    onMouseUp);
      document.removeEventListener('mouseover',  onMouseOver);
      cancelAnimationFrame(rafId);
    };
  }, [isPointerFine]);

  if (!isPointerFine) return null;

  return (
    <>
      {/* Dot — snaps instantly to mouse */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[99999] rounded-full will-change-transform"
        style={{
          width:      hovering ? '10px' : clicking ? '5px' : '8px',
          height:     hovering ? '10px' : clicking ? '5px' : '8px',
          background: hovering ? '#16a34a' : '#111827',
          transition: 'width 0.12s, height 0.12s, background 0.15s',
          boxShadow:  hovering ? '0 0 6px rgba(22,163,74,0.8)' : 'none',
        }}
      />

      {/* Ring — lags for smooth trail effect */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[99998] rounded-full will-change-transform"
        style={{
          width:      hovering ? '40px' : clicking ? '24px' : '32px',
          height:     hovering ? '40px' : clicking ? '24px' : '32px',
          border:     `2px solid ${hovering ? '#22c55e' : 'rgba(17,24,39,0.35)'}`,
          background: hovering ? 'rgba(34,197,94,0.08)' : 'transparent',
          transition: 'width 0.18s, height 0.18s, border-color 0.18s, background 0.18s',
          boxShadow:  hovering ? '0 0 12px rgba(34,197,94,0.25)' : 'none',
        }}
      />
    </>
  );
};

export default CustomCursor;
