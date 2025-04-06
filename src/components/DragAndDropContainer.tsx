"use client";

import React, { useState, useEffect, type ReactNode } from "react";

interface DragAndDropContainerProps {
  children: ReactNode;
  onDropImage?: (file: File) => void;
}

const DragAndDropContainer: React.FC<DragAndDropContainerProps> = ({ children, onDropImage }) => {
  const [isDragging, setIsDragging] = useState(false);

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
          if (onDropImage) {
            onDropImage(file);
          }
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
  }, [onDropImage]);

  return (
    <>
      {children}
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
    </>
  );
};

export default DragAndDropContainer;