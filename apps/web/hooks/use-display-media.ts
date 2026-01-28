import { tryCatch } from "@/lib/utils";
import { useRef, useState } from "react";

export function useDisplayMedia() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isAudioEnabled, setAudioEnabled] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);

  const controllerRef = useRef<AbortController>(null);

  const toggleAudioEnabled = () => {
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setAudioEnabled(audioTrack.enabled);
    audioTrack.dispatchEvent(new Event("enabled"));
  };

  const stopDisplayMedia = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    mediaStream?.getTracks().forEach((track) => {
      track.stop();
    });

    setError(null);
    setAudioTrack(null);
    setVideoTrack(null);
    setMediaStream(null);
    setAudioEnabled(false);
  };

  const startDisplayMedia = async () => {
    setError(null);
    setLoading(true);

    const { success, data: stream } = await tryCatch(
      navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true,
      }),
    );

    setLoading(false);

    if (!success) {
      setError(new Error("Failed to get display media"));
      return;
    }

    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];

    setMediaStream(stream);
    setAudioTrack(audioTrack ?? null);
    setVideoTrack(videoTrack ?? null);
    setAudioEnabled(!!audioTrack?.enabled);

    controllerRef.current ??= new AbortController();
    const { signal } = controllerRef.current;

    stream.getTracks().forEach((track) => {
      track.addEventListener("ended", stopDisplayMedia, { signal });
    });
  };

  return {
    error,
    isLoading,
    audioTrack,
    videoTrack,
    mediaStream,
    isAudioEnabled,
    stopDisplayMedia,
    startDisplayMedia,
    toggleAudioEnabled,
  };
}
