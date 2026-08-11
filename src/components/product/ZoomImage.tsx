"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Product image with a magnifier lens: hovering shows a circular lens with a
 * zoomed view following the cursor. Touch devices just get the large image.
 */
export function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const box = useRef<HTMLDivElement>(null);
  const canHover = useMediaQuery("(hover: hover)");
  const [lens, setLens] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const LENS = 200;
  const ZOOM = 2.4;

  const onMove = (e: React.MouseEvent) => {
    if (!canHover) return;
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setLens({
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      w: r.width,
      h: r.height,
    });
  };

  return (
    <div
      ref={box}
      onMouseMove={onMove}
      onMouseLeave={() => setLens(null)}
      className="relative h-full w-full cursor-zoom-in"
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="600px"
        priority
        className="object-contain"
      />
      {lens && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 rounded-full border-2 border-white bg-white shadow-[0_10px_40px_rgba(21,40,60,.35)]"
          style={{
            width: LENS,
            height: LENS,
            left: lens.x - LENS / 2,
            top: lens.y - LENS / 2,
            backgroundImage: `url('${src}')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${lens.w * ZOOM}px ${lens.h * ZOOM}px`,
            backgroundPosition: `${-(lens.x * ZOOM - LENS / 2)}px ${-(lens.y * ZOOM - LENS / 2)}px`,
          }}
        />
      )}
    </div>
  );
}
