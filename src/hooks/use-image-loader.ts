import { useEffect, useRef, useState } from "react";

export function useImageLoader(initialUrl: string | null = null) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialUrl);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!event.clipboardData) return;
      const items = event.clipboardData.items;
      for (const item of items) {
        if (!item) continue;
        if (item.type.includes("image")) {
          const file = item.getAsFile();
          if (file) {
            loadImage(file);
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
    if (!imageUrl) {
      imageRef.current = null;
      setIsImageLoaded(false);
      return;
    }

    setIsImageLoaded(false);
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      setIsImageLoaded(true);
    };
  }, [imageUrl]);

  const loadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return { imageRef, imageUrl, setImageUrl, loadImage, isImageLoaded };
}