import React from "react";
import { useTheme } from "next-themes";

interface ImagePreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  bgContainerRef: React.RefObject<HTMLDivElement | null>;
  imageRef?: React.RefObject<HTMLImageElement | null>;
  imageUrl?: string;
  rows?: number | null;
  columns?: number | null;
  cellWidth?: number;
  cellHeight?: number;
  offsetX?: number;
  offsetY?: number;
  marginX?: number;
  marginY?: number;
  setOffsetX?: (value: number) => void;
  setOffsetY?: (value: number) => void;
}

import { useEffect, useRef, useState } from "react";

const ImagePreview: React.FC<ImagePreviewProps> = ({
  canvasRef,
  bgContainerRef,
  imageUrl,
  rows,
  columns,
  cellWidth,
  cellHeight,
  offsetX,
  offsetY,
  marginX,
  marginY,
  imageRef,
  setOffsetX,
  setOffsetY,
}) => {

  function safeNumber(value: string | number | null | undefined, fallback = 0): number {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  const dpr = window.devicePixelRatio || 1;

  const [dprRefresh, setDprRefresh] = useState(false);
  const { theme } = useTheme();

  const dashOffsetRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const initialOffsetRef = useRef<{ x: number; y: number }>({ x: offsetX ?? 0, y: offsetY ?? 0 });

  /** Utility: get canvas coordinates from event */
  function getCanvasCoords(
    e: MouseEvent | React.MouseEvent<HTMLCanvasElement, MouseEvent>,
    canvas: HTMLCanvasElement | null,
    dpr: number
  ) {
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top) * dpr,
    };
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!canvasRef.current) return;
    const { x, y } = getCanvasCoords(e, canvasRef.current, dpr);
    isDraggingRef.current = true;
    dragStartRef.current = { x, y };
    initialOffsetRef.current = { x: offsetX ?? 0, y: offsetY ?? 0 };
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !dragStartRef.current) return;
      if (!canvasRef.current) return;
      const { x, y } = getCanvasCoords(e, canvasRef.current, dpr);
      const dx = (x - dragStartRef.current.x) / dpr;
      const dy = (y - dragStartRef.current.y) / dpr;
      setOffsetX?.(initialOffsetRef.current.x + dx * dpr);
      setOffsetY?.(initialOffsetRef.current.y + dy * dpr);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dpr, setOffsetX, setOffsetY, canvasRef, offsetX, offsetY]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Draw static content once when dependencies change
  useEffect(() => {

    const img = imageRef?.current;

    // Skip rendering if image not loaded yet
    if (!img?.width || !img?.height) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = img.width * dpr;
    canvas.height = img.height * dpr;

    // Create or resize offscreen static canvas
    staticCanvasRef.current ??= document.createElement("canvas");
    const staticCanvas = staticCanvasRef.current;
    staticCanvas.width = img.width * dpr;
    staticCanvas.height = img.height * dpr;
    // No need to set style size for offscreen canvas

    const staticCtx = staticCanvas.getContext("2d");
    if (!staticCtx) return;

    // Draw image
    staticCtx.drawImage(img, 0, 0, img.width * dpr, img.height * dpr);

    // Draw outer rounded rectangle border
    const borderX = ((marginX ?? 0) * dpr + (offsetX ?? 0) * dpr);
    const borderY = ((marginY ?? 0) * dpr + (offsetY ?? 0) * dpr);

    const totalGridWidth = (columns ?? 1) * (cellWidth ?? 0) * dpr;
    const totalGridHeight = (rows ?? 1) * (cellHeight ?? 0) * dpr;

    const borderWidth = totalGridWidth;
    const borderHeight = totalGridHeight;
    const radius = 20 * dpr;

    staticCtx.strokeStyle = theme === "dark" ? "#fff" : "#000";
    staticCtx.lineWidth = 1 * dpr;

    staticCtx.beginPath();
    staticCtx.roundRect(borderX, borderY, borderWidth, borderHeight, radius);
    staticCtx.stroke();

    // Cache main canvas context
    const ctx = canvas.getContext("2d");
    // Do not scale main canvas context; scale drawing operations manually
    ctxRef.current = ctx;
  }, [imageUrl, rows, columns, cellWidth, cellHeight, offsetX, offsetY, marginX, marginY, theme, imageRef, bgContainerRef, canvasRef, dprRefresh, dpr]);

  // Animate dashed overlay
  useEffect(() => {
    const animate = () => {
      const ctx = ctxRef.current;
      const staticCanvas = staticCanvasRef.current;
      if (!ctx || !staticCanvas) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Draw static content first
      ctx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
      ctx.drawImage(staticCanvas, 0, 0);

      // Animate dashed grid overlay
      ctx.save();
      ctx.strokeStyle = theme === "dark" ? "white" : "black";
      ctx.lineWidth = 1 * dpr;
      ctx.setLineDash([8 * dpr, 8 * dpr]);
      dashOffsetRef.current = (dashOffsetRef.current + 0.2 * dpr) % (16 * dpr);
      ctx.lineDashOffset = dashOffsetRef.current;

      const columnsVal = safeNumber(columns, 1);
      const rowsVal = safeNumber(rows, 1);

      const cellWidthVal = safeNumber(cellWidth) * dpr;
      const cellHeightVal = safeNumber(cellHeight) * dpr;

      const totalGridWidth = columnsVal * cellWidthVal;
      const totalGridHeight = rowsVal * cellHeightVal;

      const clipX = safeNumber(marginX) * dpr + safeNumber(offsetX) * dpr;
      const clipY = safeNumber(marginY) * dpr + safeNumber(offsetY) * dpr;
      const clipWidth = totalGridWidth;
      const clipHeight = totalGridHeight;

      ctx.beginPath();
      ctx.rect(clipX, clipY, clipWidth, clipHeight);
      ctx.clip();

      for (let i = 1; i < columnsVal; i++) {
        const x = safeNumber(marginX) * dpr + safeNumber(offsetX) * dpr + i * cellWidthVal;
        ctx.beginPath();
        ctx.moveTo(x, clipY);
        ctx.lineTo(x, clipY + clipHeight);
        ctx.stroke();
      }

      for (let i = 1; i < rowsVal; i++) {
        const y = safeNumber(marginY) * dpr + safeNumber(offsetY) * dpr + i * cellHeightVal;
        ctx.beginPath();
        ctx.moveTo(clipX, y);
        ctx.lineTo(clipX + clipWidth, y);
        ctx.stroke();
      }

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [theme, rows, columns, cellWidth, cellHeight, offsetX, offsetY, marginX, marginY, dpr]);
  useEffect(() => {
    const handleDPRChange = () => {
      setDprRefresh(prev => !prev);
    };

    // Listen for DPR changes (this event is not supported in all browsers)
    if (window.matchMedia) {
      const mql = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      mql.addEventListener('change', handleDPRChange);
      return () => {
        mql.removeEventListener('change', handleDPRChange);
      };
    }
  }, []);

  return (
    <div ref={bgContainerRef} className="my-auto bg-muted rounded-lg p-4 flex justify-center items-center">
      <img
        ref={imageRef}
        src={imageUrl}
        alt="hidden source"
        style={{ display: "none" }}
      />
      <div className="flex justify-center items-center w-full">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain"
          onMouseDown={handleMouseDown}
        />
      </div>
    </div>
  );
};

export default ImagePreview;