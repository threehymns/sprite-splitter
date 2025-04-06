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
}

import { useEffect, useRef } from "react";

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
}) => {
  const { theme } = useTheme();

  const dpr = window.devicePixelRatio || 1;

  const dashOffsetRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Draw static content once when dependencies change
  useEffect(() => {
    if (
      !imageRef?.current ||
      !rows ||
      !columns ||
      cellWidth === undefined ||
      cellHeight === undefined ||
      offsetX === undefined ||
      offsetY === undefined ||
      marginX === undefined ||
      marginY === undefined
    ) {
      return;
    }

    const img = imageRef.current;

    // Skip rendering if image not loaded yet
    if (!img.width || !img.height) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;

    // Resize canvas for high DPI
    canvas.width = img.width * dpr;
    canvas.height = img.height * dpr;

    // Create or resize offscreen static canvas
    if (!staticCanvasRef.current) {
      staticCanvasRef.current = document.createElement("canvas");
    }
    const staticCanvas = staticCanvasRef.current;
    staticCanvas.width = img.width * dpr;
    staticCanvas.height = img.height * dpr;
    // No need to set style size for offscreen canvas

    const staticCtx = staticCanvas.getContext("2d");
    if (!staticCtx) return;

    // Do not scale static canvas context; instead scale drawing operations manually for high DPI
    staticCtx.fillStyle = "rgba(0,0,0,0)";
    staticCtx.fillRect(0, 0, staticCanvas.width, staticCanvas.height);

    // Draw image
    staticCtx.drawImage(img, 0, 0, img.width * dpr, img.height * dpr);

    // Do NOT draw the dashed grid here anymore.
    // The animated dashed grid will be drawn in the animation loop only.

    // Draw outer rounded rectangle border
    const borderX = (marginX + offsetX) * dpr;
    const borderY = (marginY + offsetY) * dpr;

    const totalGridWidth = columns * cellWidth;
    const totalGridHeight = rows * cellHeight;

    const borderWidth = totalGridWidth * dpr;
    const borderHeight = totalGridHeight * dpr;
    const radius = 20 * dpr;

    staticCtx.strokeStyle = theme === "dark" ? "#fff" : "#000";
    staticCtx.lineWidth = 1 * dpr;
    staticCtx.setLineDash([]);

    staticCtx.beginPath();
    if (typeof staticCtx.roundRect === "function") {
      staticCtx.roundRect(borderX, borderY, borderWidth, borderHeight, radius);
    } else {
      const r = radius;
      staticCtx.moveTo(borderX + r, borderY);
      staticCtx.lineTo(borderX + borderWidth - r, borderY);
      staticCtx.quadraticCurveTo(borderX + borderWidth, borderY, borderX + borderWidth, borderY + r);
      staticCtx.lineTo(borderX + borderWidth, borderY + borderHeight - r);
      staticCtx.quadraticCurveTo(borderX + borderWidth, borderY + borderHeight, borderX + borderWidth - r, borderY + borderHeight);
      staticCtx.lineTo(borderX + r, borderY + borderHeight);
      staticCtx.quadraticCurveTo(borderX, borderY + borderHeight, borderX, borderY + borderHeight - r);
      staticCtx.lineTo(borderX, borderY + r);
      staticCtx.quadraticCurveTo(borderX, borderY, borderX + r, borderY);
    }
    staticCtx.stroke();

    // Cache main canvas context
    const ctx = canvas.getContext("2d");
    // Do not scale main canvas context; scale drawing operations manually
    ctxRef.current = ctx;
  }, [imageUrl, rows, columns, cellWidth, cellHeight, offsetX, offsetY, marginX, marginY, theme, imageRef, bgContainerRef, canvasRef]);

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

      const marginXVal = (Number.isFinite(Number(marginX)) ? Number(marginX) : 0) * dpr;
      const marginYVal = (Number.isFinite(Number(marginY)) ? Number(marginY) : 0) * dpr;
      const offsetXVal = (Number.isFinite(Number(offsetX)) ? Number(offsetX) : 0) * dpr;
      const offsetYVal = (Number.isFinite(Number(offsetY)) ? Number(offsetY) : 0) * dpr;

      const cellWidthRaw = Number.isFinite(Number(cellWidth)) ? Number(cellWidth) : 0;
      const cellHeightRaw = Number.isFinite(Number(cellHeight)) ? Number(cellHeight) : 0;
      const columnsVal = Number.isFinite(Number(columns)) ? Number(columns) : 0;
      const rowsVal = Number.isFinite(Number(rows)) ? Number(rows) : 0;

      const totalGridWidth = columnsVal * cellWidthRaw;
      const totalGridHeight = rowsVal * cellHeightRaw;

      const cellWidthVal = cellWidthRaw * dpr;
      const cellHeightVal = cellHeightRaw * dpr;
      const totalGridWidthScaled = totalGridWidth * dpr;
      const totalGridHeightScaled = totalGridHeight * dpr;

      const clipX = marginXVal + offsetXVal;
      const clipY = marginYVal + offsetYVal;
      const clipWidth = totalGridWidthScaled;
      const clipHeight = totalGridHeightScaled;

      ctx.beginPath();
      ctx.rect(clipX, clipY, clipWidth, clipHeight);
      ctx.clip();

      for (let i = 1; i < columnsVal; i++) {
        const x = marginXVal + offsetXVal + i * cellWidthVal;
        ctx.beginPath();
        ctx.moveTo(x, clipY);
        ctx.lineTo(x, clipY + clipHeight);
        ctx.stroke();
      }

      for (let i = 1; i < rowsVal; i++) {
        const y = marginYVal + offsetYVal + i * cellHeightVal;
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

  return (
    <div ref={bgContainerRef} className="my-auto bg-muted rounded-lg p-4 flex justify-center items-center">
      <img
        ref={imageRef}
        src={imageUrl}
        alt="hidden source"
        style={{ display: "none" }}
      />
      <div className="flex justify-center items-center w-full">
        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
      </div>
    </div>
  );
};

export default ImagePreview;