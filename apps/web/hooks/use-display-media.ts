import { useCallback, useMemo, useRef, useState } from "react";

export interface DisplayMediaState {
  isLoading: boolean;
  error: Error | null;
  mediaStream: MediaStream | null;
}

export function useDisplayMedia() {
  const [state, setState] = useState<DisplayMediaState>({
    error: null,
    isLoading: true,
    mediaStream: null,
  });

  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startDisplayMedia = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      mediaStreamRef.current = mediaStream;

      setState({
        mediaStream,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      setState({
        isLoading: false,
        mediaStream: null,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to get display media"),
      });
    }
  }, []);

  const stopDisplayMedia = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      mediaStreamRef.current = null;
    }

    setState({
      error: null,
      isLoading: false,
      mediaStream: null,
    });
  }, []);

  const displayMedia = useMemo(() => {
    return {
      ...state,
      startDisplayMedia,
      stopDisplayMedia,
    };
  }, [state, startDisplayMedia, stopDisplayMedia]);

  return displayMedia;
}
