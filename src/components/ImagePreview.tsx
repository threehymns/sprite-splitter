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

import { useEffect } from "react";

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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Fill canvas background with bg-muted color
      if (bgContainerRef.current) {
        const bgColor = theme === "dark" ? "#1e1e1e" : "#f9f9f9";
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      ctx.save();
      ctx.strokeStyle = theme === "dark" ? "white" : "black";
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 8]); // dashed lines

      // Define clipping region matching the grid area
      const clipX = marginX + offsetX;
      const clipY = marginY + offsetY;
      const clipWidth = columns * cellWidth;
      const clipHeight = rows * cellHeight;

      ctx.save();
      ctx.beginPath();
      ctx.rect(clipX, clipY, clipWidth, clipHeight);
      ctx.clip();

      for (let i = 1; i < columns; i++) {
        const x = marginX + offsetX + i * cellWidth;
        ctx.beginPath();
        ctx.moveTo(x, clipY);
        ctx.lineTo(x, clipY + clipHeight);
        ctx.stroke();
      }

      for (let i = 1; i < rows; i++) {
        const y = marginY + offsetY + i * cellHeight;
        ctx.beginPath();
        ctx.moveTo(clipX, y);
        ctx.lineTo(clipX + clipWidth, y);
        ctx.stroke();
      }

      ctx.restore(); // restore saved state before clipping

      // Draw outer rounded rectangle border
      const borderX = marginX + offsetX;
      const borderY = marginY + offsetY;
      const borderWidth = columns * cellWidth;
      const borderHeight = rows * cellHeight;
      const radius = 16;

      const ctx2 = canvas.getContext("2d");
      if (ctx2) {
        ctx2.strokeStyle = theme === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
        ctx2.lineWidth = 2;
        ctx2.setLineDash([]); // solid border

        ctx2.beginPath();
        if (typeof ctx2.roundRect === "function") {
          ctx2.roundRect(borderX, borderY, borderWidth, borderHeight, radius);
        } else {
          // fallback for browsers without roundRect
          const r = radius;
          ctx2.moveTo(borderX + r, borderY);
          ctx2.lineTo(borderX + borderWidth - r, borderY);
          ctx2.quadraticCurveTo(borderX + borderWidth, borderY, borderX + borderWidth, borderY + r);
          ctx2.lineTo(borderX + borderWidth, borderY + borderHeight - r);
          ctx2.quadraticCurveTo(borderX + borderWidth, borderY + borderHeight, borderX + borderWidth - r, borderY + borderHeight);
          ctx2.lineTo(borderX + r, borderY + borderHeight);
          ctx2.quadraticCurveTo(borderX, borderY + borderHeight, borderX, borderY + borderHeight - r);
          ctx2.lineTo(borderX, borderY + r);
          ctx2.quadraticCurveTo(borderX, borderY, borderX + r, borderY);
        }
        ctx2.stroke();
      }
    };

    requestAnimationFrame(draw);
  }, [imageUrl, rows, columns, cellWidth, cellHeight, offsetX, offsetY, marginX, marginY, theme, imageRef, bgContainerRef, canvasRef]);

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