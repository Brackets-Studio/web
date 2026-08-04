"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const HOVER_SELECTOR =
  "a, button, [role='button'], input, textarea, select, [data-cursor-hover]";

const RING_EASE = [0.16, 1, 0.3, 1] as const;

function subscribeFinePointer(callback: () => void) {
  const mql = window.matchMedia("(pointer: fine)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
function getFinePointerSnapshot() {
  return window.matchMedia("(pointer: fine)").matches;
}
function getFinePointerServerSnapshot() {
  return false;
}

/**
 * Replaces the native pointer with a circular ring (fine-pointer devices
 * only) that opens into the brand's "{ }" mark when hovering anything
 * interactive — a nod to the wordmark instead of a generic dot cursor.
 */
export function Cursor() {
  const enabled = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot,
  );
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ringX = useSpring(x, { damping: 28, stiffness: 320, mass: 0.5 });
  const ringY = useSpring(y, { damping: 28, stiffness: 320, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("custom-cursor");

    const handleMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const handleOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      setHovering(Boolean(target?.closest(HOVER_SELECTOR)));
    };
    const handleLeaveWindow = () => setVisible(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerover", handleOver);
    document.documentElement.addEventListener("mouseleave", handleLeaveWindow);

    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerover", handleOver);
      document.documentElement.removeEventListener("mouseleave", handleLeaveWindow);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-120"
      style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.span
        className="absolute top-1/2 left-1/2 block size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ backgroundColor: "var(--brand)" }}
        animate={{ opacity: hovering ? 0 : 1, scale: hovering ? 0 : 1 }}
        transition={{ duration: 0.2, ease: RING_EASE }}
      />
      <motion.div
        className="relative flex items-center justify-center rounded-full border-2"
        style={{ borderColor: "var(--brand)" }}
        animate={{ width: hovering ? 44 : 26, height: hovering ? 44 : 26 }}
        transition={{ duration: 0.25, ease: RING_EASE }}
      >
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: "var(--brand)" }}
          animate={{ opacity: hovering ? 0.12 : 0 }}
          transition={{ duration: 0.25, ease: RING_EASE }}
        />
        <motion.span
          className="relative font-mono text-[11px] font-bold tracking-tight"
          style={{ color: "var(--brand)" }}
          animate={{ opacity: hovering ? 1 : 0, scale: hovering ? 1 : 0.5 }}
          transition={{ duration: 0.2, ease: RING_EASE }}
        >
          {"{ }"}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
