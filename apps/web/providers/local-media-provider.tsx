"use client";

import { useDisplayMedia } from "@/hooks/use-display-media";
import { useMediaDevices } from "@/hooks/use-media-devices";
import { useUserMedia } from "@/hooks/use-user-media";
import { createContext, use, useEffect, useEffectEvent, useState } from "react";

export interface LocalMediaContextValue {
  selectedAudioInput?: string;
  selectedVideoInput?: string;
  selectedAudioOutput?: string;
  setSelectedAudioInput: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  setSelectedVideoInput: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  setSelectedAudioOutput: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  userMedia: ReturnType<typeof useUserMedia>;
  displayMedia: ReturnType<typeof useDisplayMedia>;
}

const LocalMediaContext = createContext<LocalMediaContextValue | null>(null);

export default function LocalMediaProvider({
  children,
}: React.PropsWithChildren) {
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>();
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>();
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>();

  const { cameras, microphones, speakers } = useMediaDevices();
  const displayMedia = useDisplayMedia();
  const userMedia = useUserMedia({
    audioDeviceId: selectedAudioInput,
    videoDeviceId: selectedVideoInput,
  });

  const selectDevices = useEffectEvent(
    (
      cameras: MediaDeviceInfo[],
      speakers: MediaDeviceInfo[],
      microphones: MediaDeviceInfo[],
    ) => {
      if (!selectedAudioInput && microphones.length > 0) {
        setSelectedAudioInput(microphones[0]?.deviceId);
      }
      if (!selectedVideoInput && cameras.length > 0) {
        setSelectedVideoInput(cameras[0]?.deviceId);
      }
      if (!selectedAudioOutput && speakers.length > 0) {
        setSelectedAudioOutput(speakers[0]?.deviceId);
      }
    },
  );

  useEffect(() => {
    selectDevices(cameras, speakers, microphones);
  }, [cameras, speakers, microphones]);

  return (
    <LocalMediaContext
      value={{
        userMedia,
        displayMedia,
        selectedAudioInput,
        selectedVideoInput,
        selectedAudioOutput,
        setSelectedAudioInput,
        setSelectedVideoInput,
        setSelectedAudioOutput,
      }}
    >
      {children}
    </LocalMediaContext>
  );
}

export const useLocalMedia = () => {
  const context = use(LocalMediaContext);

  if (!context) {
    throw new Error("useLocalMedia must be used within LocalMediaProvider");
  }

  return context;
};
