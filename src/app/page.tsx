"use client";

import React, { useRef } from "react";
import { useImageLoader } from "@/hooks/use-image-loader";
import { useSpriteSlicer } from "@/hooks/use-sprite-slicer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import DragAndDropContainer from "@/components/DragAndDropContainer";
import Header from "@/components/Header";
import SidebarComponent from "@/components/Sidebar";
import MainContent from "@/components/MainContent";


export default function HomePage() {
  const { imageRef, imageUrl, setImageUrl, loadImage, isImageLoaded } = useImageLoader();
  const {
    cellWidth,
    cellHeight,
    offsetX,
    offsetY,
    marginX,
    marginY,
    rows,
    columns,
    slices,
    setOffsetX,
    setOffsetY,
    setMarginX,
    setMarginY,
    setRows,
    setColumns,
    handleDownloadZip,
  } = useSpriteSlicer({ imageRef, imageUrl, isImageLoaded });

  const bgContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <DragAndDropContainer onDropImage={loadImage}>
      <SidebarProvider>
        <SidebarInset>
          {/* Header */}
          <Header />
          <MainContent
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            loadImage={loadImage}
            canvasRef={canvasRef}
            bgContainerRef={bgContainerRef}
            slices={slices}
            handleDownloadZip={handleDownloadZip}
            imageRef={imageRef}
            rows={rows}
            columns={columns}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            offsetX={offsetX}
            offsetY={offsetY}
            marginX={marginX}
            marginY={marginY}
          />
        </SidebarInset>

        {/* Sidebar */}
        <SidebarComponent
          offsetX={offsetX}
          setOffsetX={setOffsetX}
          offsetY={offsetY}
          setOffsetY={setOffsetY}
          marginX={marginX}
          setMarginX={setMarginX}
          marginY={marginY}
          setMarginY={setMarginY}
          columns={columns ?? 1}
          setColumns={setColumns}
          rows={rows ?? 1}
          setRows={setRows}
        />
      </SidebarProvider>
    </DragAndDropContainer>
  );
}
