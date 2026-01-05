"use client";

import { useDisplayMedia } from "@/hooks/use-display-media";
import { useMediaDevices } from "@/hooks/use-media-devices";
import { useUserMedia } from "@/hooks/use-user-media";
import {
  createContext,
  use,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";

interface LocalMediaContextValue {
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  refetchMedia: () => Promise<void>;
  shareScreen: () => Promise<void>;
  stopScreenSharing: () => void;
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
  videoRef: React.RefObject<HTMLVideoElement | null>;
  displayVideoRef: React.RefObject<HTMLVideoElement | null>;
}

const LocalMediaContext = createContext<LocalMediaContextValue>({
  isAudioMuted: false,
  isVideoMuted: false,
  toggleAudio: () => void 0,
  toggleVideo: () => void 0,
  videoRef: { current: null },
  displayVideoRef: { current: null },
  setSelectedAudioInput: () => void 0,
  setSelectedVideoInput: () => void 0,
  setSelectedAudioOutput: () => void 0,
  refetchMedia: () => Promise.resolve(),
  shareScreen: () => Promise.resolve(),
  stopScreenSharing: () => void 0,
});

export default function LocalMediaProvider({
  children,
}: React.PropsWithChildren) {
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>();
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>();
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>();

  const {
    stream,
    toggleAudio,
    toggleVideo,
    isAudioMuted,
    isVideoMuted,
    refetchMedia,
  } = useUserMedia({
    audioDeviceId: selectedAudioInput,
    videoDeviceId: selectedVideoInput,
  });

  const {
    stream: displayStream,
    startDisplayMedia,
    stopDisplayMedia,
  } = useDisplayMedia();

  const { cameras, microphones, speakers } = useMediaDevices();

  const videoRef = useRef<HTMLVideoElement>(null);
  const displayVideoRef = useRef<HTMLVideoElement>(null);

  const selectDevices = useEffectEvent(() => {
    if (!selectedAudioInput && microphones.length > 0) {
      setSelectedAudioInput(microphones[0].deviceId);
    }
    if (!selectedVideoInput && cameras.length > 0) {
      setSelectedVideoInput(cameras[0].deviceId);
    }
    if (!selectedAudioOutput && speakers.length > 0) {
      setSelectedAudioOutput(speakers[0].deviceId);
    }
  });

  useEffect(() => {
    selectDevices();
  }, [cameras, speakers, microphones]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (displayVideoRef.current && displayStream) {
      displayVideoRef.current.srcObject = displayStream;
    }
  }, [displayStream]);

  return (
    <LocalMediaContext
      value={{
        videoRef,
        displayVideoRef,
        toggleAudio,
        toggleVideo,
        isAudioMuted,
        isVideoMuted,
        refetchMedia,
        selectedAudioInput,
        selectedVideoInput,
        selectedAudioOutput,
        setSelectedAudioInput,
        setSelectedVideoInput,
        setSelectedAudioOutput,
        shareScreen: startDisplayMedia,
        stopScreenSharing: stopDisplayMedia,
      }}
    >
      {children}
    </LocalMediaContext>
  );
}

export const useLocalMedia = () => use(LocalMediaContext);
