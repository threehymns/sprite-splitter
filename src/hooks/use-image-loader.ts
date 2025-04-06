import { useEffect, useRef, useState } from "react";

export function useImageLoader(initialUrl: string | null = null) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialUrl);
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
    if (!imageUrl) {
      imageRef.current = null;
      return;
    }

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
    };
  }, [imageUrl]);

  const loadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return { imageRef, imageUrl, setImageUrl, loadImage };
}