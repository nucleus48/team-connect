"use client";

import { createContext, use, useEffect, useReducer, useState } from "react";
import { useProduceMedia } from "../hooks/use-produce-media";

export type UserMediaContextValue = {
  mediaStream?: MediaStream;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  toggleAudioEnabled: () => void;
  toggleVideoEnabled: () => void;
  setAudioDeviceId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setVideoDeviceId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const UserMediaContext = createContext<UserMediaContextValue | null>(null);

export default function UserMediaProvider({
  children,
}: React.PropsWithChildren) {
  const [mediaStream, setMediaStream] = useState<MediaStream>();
  const [audioDeviceId, setAudioDeviceId] = useState<string>();
  const [videoDeviceId, setVideoDeviceId] = useState<string>();
  const [isAudioEnabled, toggleAudioEnabled] = useReducer((t) => !t, false);
  const [isVideoEnabled, toggleVideoEnabled] = useReducer((t) => !t, false);

  useProduceMedia(mediaStream, isAudioEnabled, isVideoEnabled);

  useEffect(() => {
    (async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
          },
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        setMediaStream(mediaStream);
      } catch (error) {
        console.error("Failed to access media devices:", error);
        // Consider setting an error state or showing a user-friendly message
      }
    })();
  }, []);

  return (
    <UserMediaContext
      value={{
        mediaStream,
        isAudioEnabled,
        isVideoEnabled,
        setAudioDeviceId,
        setVideoDeviceId,
        toggleAudioEnabled,
        toggleVideoEnabled,
      }}
    >
      {children}
    </UserMediaContext>
  );
}

export const useUserMedia = () => use(UserMediaContext)!;
