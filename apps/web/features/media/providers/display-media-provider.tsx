"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

export type DisplayMediaContextValue = {
  isAudioEnabled: boolean;
  isSharingScreen: boolean;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  stopScreenSharing: () => void;
  toggleAudioEnabled: () => void;
  shareScreen: () => Promise<void>;
};

const DisplayMediaContext = createContext<DisplayMediaContextValue | null>(
  null,
);

export default function DisplayMediaProvider({
  children,
}: React.PropsWithChildren) {
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack>();
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack>();
  const [isAudioEnabled, setAudioEnabled] = useState(false);

  const isSharingScreen = useMemo(() => !!videoTrack, [videoTrack]);
  const computedAudioTrack = useMemo(
    () => (isAudioEnabled ? audioTrack : undefined),
    [isAudioEnabled, audioTrack],
  );

  useEffect(() => () => void audioTrack?.stop(), [audioTrack]);
  useEffect(() => () => void videoTrack?.stop(), [videoTrack]);

  const toggleAudioEnabled = useCallback(() => {
    setAudioEnabled((p) => !p);
  }, []);

  const shareScreen = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia();
      const [videoTrack] = stream.getVideoTracks();
      const [audioTrack] = stream.getAudioTracks();

      if (videoTrack) setVideoTrack(videoTrack);
      if (audioTrack) {
        setAudioTrack(audioTrack);
        setAudioEnabled(true);
      }
    } catch {
      toast.error("Screen sharing failed");
    }
  }, []);

  const stopScreenSharing = useCallback(() => {
    setAudioTrack(undefined);
    setVideoTrack(undefined);
    setAudioEnabled(false);
  }, []);

  return (
    <DisplayMediaContext
      value={{
        videoTrack,
        shareScreen,
        isAudioEnabled,
        isSharingScreen,
        stopScreenSharing,
        toggleAudioEnabled,
        audioTrack: computedAudioTrack,
      }}
    >
      {children}
    </DisplayMediaContext>
  );
}

export const useDisplayMedia = () => use(DisplayMediaContext)!;
