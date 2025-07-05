"use client";

import { createContext, use, useCallback, useEffect, useState } from "react";

export type MediaContextValue = {
  mediaDevices: MediaDeviceInfo[];
  userStream?: MediaStream;
  displayStreams: MediaStream[];
  startUserStream?: (constraints: MediaStreamConstraints) => Promise<void>;
  addDisplayStream?: (options: DisplayMediaStreamOptions) => Promise<void>;
  removeDisplayStream?: (streamId: string) => void;
};

const MediaContext = createContext<MediaContextValue>({
  mediaDevices: [],
  displayStreams: [],
});

export default function MediaProvider({ children }: React.PropsWithChildren) {
  const [mediaDevices, setMediaDevices] = useState<MediaDeviceInfo[]>([]);
  const [displayStreams, setDisplayStreams] = useState<MediaStream[]>([]);
  const [userStream, setUserStream] = useState<MediaStream>();

  const startUserStream = useCallback(
    async (constraints: MediaStreamConstraints) => {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setUserStream(stream);
    },
    [],
  );

  const addDisplayStream = useCallback(
    async (options: DisplayMediaStreamOptions) => {
      const stream = await navigator.mediaDevices.getDisplayMedia(options);
      setDisplayStreams((prev) => [...prev, stream]);
    },
    [],
  );

  const removeDisplayStream = useCallback((id: string) => {
    setDisplayStreams((prev) => prev.filter((stream) => stream.id !== id));
  }, []);

  useEffect(() => {
    async function enumerateDevices() {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      setMediaDevices(mediaDevices);
    }

    enumerateDevices();
    navigator.mediaDevices.addEventListener("devicechange", enumerateDevices);

    return () =>
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        enumerateDevices,
      );
  }, []);

  return (
    <MediaContext
      value={{
        mediaDevices,
        userStream,
        displayStreams,
        addDisplayStream,
        removeDisplayStream,
        startUserStream,
      }}
    >
      {children}
    </MediaContext>
  );
}

export const useMedia = () => use(MediaContext);
