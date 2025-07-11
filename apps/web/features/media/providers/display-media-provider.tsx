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
      const mediaStream = await navigator.mediaDevices.getDisplayMedia(options);
      setDisplayMedias((mediaStreams) => [...mediaStreams, mediaStream]);
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

export const useDisplayMedia = () => use(DisplayMediaContext)!;
