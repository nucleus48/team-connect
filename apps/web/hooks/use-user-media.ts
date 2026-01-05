import { useCallback, useEffect, useRef, useState } from "react";
import { usePermission } from "./use-permission";

interface MediaStreamState {
  stream: MediaStream | null;
  error: Error | null;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isLoading: boolean;
}

interface UseMediaStreamOptions {
  audioDeviceId?: string;
  videoDeviceId?: string;
}

export function useUserMedia(options: UseMediaStreamOptions) {
  const {
    state: cameraPermission,
    requestPermission: requestCameraPermission,
  } = usePermission("camera");

  const {
    state: microphonePermission,
    requestPermission: requestMicPermission,
  } = usePermission("microphone");

  const [state, setState] = useState<MediaStreamState>({
    stream: null,
    error: null,
    isAudioMuted: false,
    isVideoMuted: false,
    isLoading: true,
  });

  const streamRef = useRef<MediaStream | null>(null);

  const getUserMedia = useCallback(async () => {
    if (cameraPermission !== "granted" && microphonePermission !== "granted") {
      setState((prev) => ({
        ...prev,
        stream: null,
        error: new Error("No permission"),
        isLoading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio:
          microphonePermission === "granted"
            ? options.audioDeviceId
              ? { deviceId: { exact: options.audioDeviceId } }
              : true
            : false,
        video:
          cameraPermission === "granted"
            ? options.videoDeviceId
              ? { deviceId: { exact: options.videoDeviceId } }
              : true
            : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      setState({
        stream,
        error: null,
        isLoading: false,
        isAudioMuted: !stream.getAudioTracks().some((t) => t.enabled),
        isVideoMuted: !stream.getVideoTracks().some((t) => t.enabled),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        stream: null,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to get media stream"),
        isLoading: false,
      }));
    }
  }, [
    cameraPermission,
    microphonePermission,
    options.audioDeviceId,
    options.videoDeviceId,
  ]);

  useEffect(() => {
    void getUserMedia();
  }, [getUserMedia]);

  const toggleAudio = () => {
    if (microphonePermission !== "granted") {
      requestMicPermission();
      return;
    }

    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
        setState((prev) => ({
          ...prev,
          isAudioMuted: !audioTracks[0].enabled,
        }));
      }
    }
  };

  const toggleVideo = () => {
    if (cameraPermission !== "granted") {
      requestCameraPermission();
      return;
    }

    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !videoTracks[0].enabled;
        setState((prev) => ({
          ...prev,
          isVideoMuted: !videoTracks[0].enabled,
        }));
      }
    }
  };

  return {
    ...state,
    toggleAudio,
    toggleVideo,
    refetchStream: getUserMedia,
  };
}
