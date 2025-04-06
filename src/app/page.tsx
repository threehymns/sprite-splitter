"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDebounce } from "react-use";
import JSZip from "jszip";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarSeparator, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarSlider } from "@/components/ui/sidebar-slider";
import { Download, Sun, Moon, Upload } from "lucide-react";

export default function HomePage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [cellWidth, setCellWidth] = useState<number>(32);
  const [cellHeight, setCellHeight] = useState<number>(32);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [marginX, setMarginX] = useState<number>(0);
  const [marginY, setMarginY] = useState<number>(0);
  const [rows, setRows] = useState<number | null>(4);
  const [columns, setColumns] = useState<number | null>(4);
  const [slices, setSlices] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const bgContainerRef = useRef<HTMLDivElement | null>(null);

  const handleSetColumns: React.Dispatch<React.SetStateAction<number | null>> = (value) => {
    if (typeof value === "function") {
      setColumns((prev) => {
        const result = value(prev ?? 0);
        return result !== undefined ? result : null;
      });
    } else {
      setColumns(value !== undefined ? value : null);
    }
  };

  const handleSetRows: React.Dispatch<React.SetStateAction<number | null>> = (value) => {
    if (typeof value === "function") {
      setRows((prev) => {
        const result = value(prev ?? 0);
        return result !== undefined ? result : null;
      });
    } else {
      setRows(value !== undefined ? value : null);
    }
  };

  const setColumnsWrapper: React.Dispatch<React.SetStateAction<number>> = (value) => {
    if (typeof value === "function") {
      handleSetColumns((prev) => {
        const safePrev = prev ?? 0;
        const result = (value as (prevState: number) => number)(safePrev);
        return result;
      });
    } else {
      handleSetColumns(value);
    }
  };

  const setRowsWrapper: React.Dispatch<React.SetStateAction<number>> = (value) => {
    if (typeof value === "function") {
      handleSetRows((prev) => {
        const safePrev = prev ?? 0;
        const result = (value as (prevState: number) => number)(safePrev);
        return result;
      });
    } else {
      handleSetRows(value);
    }
  };


  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!event.clipboardData) return;
      const items = event.clipboardData.items;
      for (const item of items) {
        if (!item) continue;
        if (item.type.includes("image")) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
          event.preventDefault();
          break;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    slices.forEach((dataUrl, idx) => {
      const base64 = dataUrl.split(",")[1] ?? "";
      zip.file(`slice_${idx + 1}.png`, base64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sprites.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Cache image when imageUrl changes
  useEffect(() => {
    if (!imageUrl) {
      imageRef.current = null;
      return;
    }
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
  }, [imageUrl]);

  // Debounced params for heavy computations
  useDebounce(
    () => {
      if (!imageRef.current || !rows || !columns) return;

      const img = imageRef.current;
      const effectiveWidth = img.width - 2 * marginX;
      const effectiveHeight = img.height - 2 * marginY;
      const autoWidth = Math.floor(effectiveWidth / columns);
      const autoHeight = Math.floor(effectiveHeight / rows);
      setCellWidth(autoWidth);
      setCellHeight(autoHeight);
    },
    100,
    [imageUrl, rows, columns, marginX, marginY]
  );

  useDebounce(
    () => {
      if (!imageRef.current || !rows || !columns) {
        setSlices([]);
        return;
      }

      const img = imageRef.current;
      const newSlices: string[] = [];
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const x = marginX + offsetX + col * cellWidth;
          const y = marginY + offsetY + row * cellHeight;

          canvas.width = cellWidth;
          canvas.height = cellHeight;

          ctx.clearRect(0, 0, cellWidth, cellHeight);
          ctx.drawImage(
            img,
            x,
            y,
            cellWidth,
            cellHeight,
            0,
            0,
            cellWidth,
            cellHeight
          );

          newSlices.push(canvas.toDataURL());
        }
      }

      setSlices(newSlices);
    },
    100,
    [imageUrl, cellWidth, cellHeight, offsetX, offsetY, marginX, marginY, rows, columns]
  );

  useEffect(() => {
    const dragCounter = { current: 0 };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (dragCounter.current > 0) {
        setIsDragging(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current <= 0) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file?.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = () => {
            setImageUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
        e.dataTransfer.clearData();
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  useEffect(() => {
    if (!imageRef.current || !rows || !columns) return;

    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Fill canvas background with bg-muted color
      if (bgContainerRef.current) {
        const style = getComputedStyle(bgContainerRef.current);
        const bgColor = style.backgroundColor;
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
  }, [imageUrl, imageLoaded, rows, columns, cellWidth, cellHeight, offsetX, offsetY, marginX, marginY, theme]);

  return (
    <SidebarProvider>
      <SidebarInset>
        {/* Header */}
        <motion.header
          className="flex justify-between items-center pt-3 pl-6 pr-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold">Spritesheet Cutter</h1>
          <SidebarTrigger />
        </motion.header>
        <div className="flex flex-col xl:flex-row gap-6 h-full p-6">
          {/* Upload + Preview Combined */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 min-w-0"
          >
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>{imageUrl ? "Preview" : "Upload Image"}</CardTitle>
                {imageUrl && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setImageUrl(null);
                      setImageLoaded(false);
                    }}
                  >
                    Clear Image
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                  {!imageUrl ? (
                    <div
                      className="flex-1 border-2 border-dashed rounded-lg p-10 space-y-6 text-center cursor-pointer hover:bg-accent transition min-h-[150px] flex flex-col justify-center items-center"
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      <Upload className="w-16 h-16 text-muted-foreground" />
                      <p className="mb-2">Drop or paste an image.</p>
                      <Input
                        id="file-input"
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setImageUrl(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div ref={bgContainerRef} className="my-auto bg-muted rounded-lg p-4 flex justify-center items-center">
                        <div className="flex justify-center items-center w-full">
                          <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
                        </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Slices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex-1 min-w-0"
          >
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Slices</CardTitle>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDownloadZip}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Download All
                </Button>
              </CardHeader>
              <CardContent className="flex-1">
                {slices.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    <AnimatePresence>
                      {slices.map((src, idx) => (
                        <motion.a
                          key={idx}
                          href={src}
                          download={`slice_${idx + 1}.png`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="block border rounded overflow-hidden"
                          initial={{ opacity: 0, scale: 0.75 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.75 }}
                          transition={{ duration: 0.3 }}
                        >
                          <img src={src} alt={`Slice ${idx}`} className="w-full h-auto" />
                        </motion.a>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex justify-center items-center min-h-[100px] text-muted-foreground">
                    No slices yet
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Download */}
        </div>
      </SidebarInset>

      {/* Sidebar */}
      <Sidebar side="right">
        <SidebarHeader className="flex flex-row justify-between items-center">
          <h2 className="text-lg font-semibold">Grid Settings</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="flex flex-col gap-8 w-full p-2">
                <SidebarSlider
                  label="Offset X"
                  unit="px"
                  value={[offsetX, setOffsetX, 0]}
                  min={-100}
                  max={100}
                />
                <SidebarSlider
                  label="Offset Y"
                  unit="px"
                  value={[offsetY, setOffsetY, 0]}
                  min={-100}
                  max={100}
                />
                <SidebarSlider
                  label="Margin X"
                  unit="px"
                  value={[marginX, setMarginX, 0]}
                  min={0}
                  max={100}
                />
                <SidebarSlider
                  label="Margin Y"
                  unit="px"
                  value={[marginY, setMarginY, 0]}
                  min={0}
                  max={100}
                />
                <SidebarSlider
                  label="Columns"
                  value={[columns ?? 1, setColumnsWrapper, 4]}
                  min={1}
                  max={20}
                />
                <SidebarSlider
                  label="Rows"
                  value={[rows ?? 1, setRowsWrapper, 4]}
                  min={1}
                  max={20}
                />
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      {isDragging && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-none"
          style={{ transition: 'opacity 0.3s' }}
        >
          <div className="text-white text-2xl font-bold pointer-events-none">
            Drop image to upload
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
