"use client";

import { createContext, use, useCallback, useState } from "react";

export type DisplayMediaContextValue = {
  displayMedias: MediaStream[];
  addDisplayMedia: (options: DisplayMediaStreamOptions) => Promise<void>;
  removeDisplayMedia: (id: string) => void;
};

const DisplayMediaContext = createContext<DisplayMediaContextValue | null>(
  null,
);

export default function DisplayMediaProvider({
  children,
}: React.PropsWithChildren) {
  const [displayMedias, setDisplayMedias] = useState<MediaStream[]>([]);

  const addDisplayMedia = useCallback(
    async (options: DisplayMediaStreamOptions) => {
      try {
        const mediaStream = await navigator.mediaDevices.getDisplayMedia(options);
        setDisplayMedias((mediaStreams) => [...mediaStreams, mediaStream]);
      } catch (error) {
        console.error('Failed to get display media:', error);
        throw error; // Re-throw to let caller handle the error
      }
    },
    [],
  );

  const removeDisplayMedia = useCallback((id: string) => {
    setDisplayMedias((displayMedias) =>
      displayMedias.filter((displayMedia) => displayMedia.id !== id),
    );
  }, []);

  return (
    <DisplayMediaContext
      value={{
        displayMedias,
        addDisplayMedia,
        removeDisplayMedia,
      }}
    >
      {children}
    </DisplayMediaContext>
  );
}

export const useDisplayMedia = () => {
  const context = use(DisplayMediaContext);
  if (!context) {
    throw new Error(
      'useDisplayMedia must be used within a DisplayMediaProvider'
    );
  }
  return context;
};
