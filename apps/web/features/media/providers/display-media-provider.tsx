"use client";

import { createContext, use, useEffect, useState } from "react";

export type DisplayMediaContextValue = {
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  setAudioTrack: React.Dispatch<
    React.SetStateAction<MediaStreamTrack | undefined>
  >;
  setVideoTrack: React.Dispatch<
    React.SetStateAction<MediaStreamTrack | undefined>
  >;
};

const DisplayMediaContext = createContext<DisplayMediaContextValue | null>(
  null,
);

export default function DisplayMediaProvider({
  children,
}: React.PropsWithChildren) {
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack>();
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack>();

  useEffect(() => () => void audioTrack?.stop(), [audioTrack]);
  useEffect(() => () => void videoTrack?.stop(), [videoTrack]);

  return (
    <DisplayMediaContext
      value={{
        audioTrack,
        videoTrack,
        setAudioTrack,
        setVideoTrack,
      }}
    >
      {children}
    </DisplayMediaContext>
  );
}

export const useDisplayMedia = () => use(DisplayMediaContext)!;
