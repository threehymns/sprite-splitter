"use client";

import React from "react";
import UploadArea from "./UploadArea";
import ImagePreview from "./ImagePreview";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";

interface UploadPanelProps {
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  loadImage: (file: File) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  bgContainerRef: React.RefObject<HTMLDivElement | null>;
  imageRef?: React.RefObject<HTMLImageElement | null>;
  rows?: number | null;
  columns?: number | null;
  cellWidth?: number;
  cellHeight?: number;
  setOffsetX?: (value: number) => void;
  setOffsetY?: (value: number) => void;
  offsetX?: number;
  offsetY?: number;
  marginX?: number;
  marginY?: number;
}

const UploadPanel: React.FC<UploadPanelProps> = ({
  imageUrl,
  setImageUrl,
  loadImage,
  canvasRef,
  bgContainerRef,
  imageRef,
  rows,
  columns,
  cellWidth,
  cellHeight,
  setOffsetX,
  setOffsetY,
  offsetX,
  offsetY,
  marginX,
  marginY,
}) => {
  const handleFileSelected = (file: File) => {
    loadImage(file);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>{imageUrl ? "Preview" : "Upload Image"}</CardTitle>
        {imageUrl && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setImageUrl(null);
            }}
          >
            Clear Image
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {!imageUrl ? (
          <UploadArea onFileSelected={handleFileSelected} />
        ) : (
          <ImagePreview
            canvasRef={canvasRef}
            bgContainerRef={bgContainerRef}
            imageRef={imageRef}
            imageUrl={imageUrl ?? ""}
            rows={rows}
            columns={columns}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            offsetX={offsetX}
            offsetY={offsetY}
            marginX={marginX}
            marginY={marginY}
            setOffsetX={setOffsetX}
            setOffsetY={setOffsetY}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default UploadPanel;