"use client";

import { useState, useRef, useCallback } from "react";

interface MapViewerProps {
  mapSrc: string | null;
  locationName?: string;
}

export function MapViewer({ mapSrc, locationName }: MapViewerProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(4, Math.max(0.25, s - e.deltaY * 0.001)));
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  if (!mapSrc) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-stone-400 text-sm text-center px-4">
        <svg className="w-8 h-8 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p>No map for current area</p>
        <p className="text-xs text-stone-600 mt-1">A map will appear when you enter a mapped location</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {locationName && (
        <p className="text-xs text-stone-400 px-1">
          <span className="text-[var(--color-gold)]">Current area:</span> {locationName}
        </p>
      )}
      <div
        className="relative overflow-hidden rounded border border-stone-700 bg-stone-950"
        style={{ height: "240px", cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mapSrc}
          alt={locationName ? `Map of ${locationName}` : "Area map"}
          draggable={false}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center center",
            maxWidth: "none",
            position: "absolute",
            top: "50%",
            left: "50%",
            marginLeft: "-50%",
            marginTop: "-50%",
            userSelect: "none",
          }}
        />
      </div>
      <div className="flex items-center justify-between px-1">
        <div className="flex gap-1">
          <button
            onClick={() => setScale((s) => Math.min(4, s + 0.25))}
            className="text-xs text-stone-400 hover:text-stone-200 px-2 py-0.5 rounded border border-stone-700 hover:border-stone-500"
          >
            +
          </button>
          <button
            onClick={() => setScale((s) => Math.max(0.25, s - 0.25))}
            className="text-xs text-stone-400 hover:text-stone-200 px-2 py-0.5 rounded border border-stone-700 hover:border-stone-500"
          >
            −
          </button>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-stone-400 hover:text-stone-300"
        >
          Reset view
        </button>
        <span className="text-xs text-stone-600">{Math.round(scale * 100)}%</span>
      </div>
    </div>
  );
}
