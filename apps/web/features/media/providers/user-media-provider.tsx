"use client";

import { createContext, use, useEffect, useState } from "react";

export type UserMediaContextValue = {
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  setAudioTrack: React.Dispatch<
    React.SetStateAction<MediaStreamTrack | undefined>
  >;
  setVideoTrack: React.Dispatch<
    React.SetStateAction<MediaStreamTrack | undefined>
  >;
};

const UserMediaContext = createContext<UserMediaContextValue | null>(null);

export default function UserMediaProvider({
  children,
}: React.PropsWithChildren) {
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack>();
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack>();

  useEffect(() => () => void audioTrack?.stop(), [audioTrack]);
  useEffect(() => () => void videoTrack?.stop(), [videoTrack]);

  return (
    <UserMediaContext
      value={{
        audioTrack,
        videoTrack,
        setAudioTrack,
        setVideoTrack,
      }}
    >
      {children}
    </UserMediaContext>
  );
}

export const useUserMedia = () => use(UserMediaContext)!;
