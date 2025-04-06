import { useState, useEffect } from "react";

export function useClipboardImage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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

  return { imageUrl, setImageUrl };
}