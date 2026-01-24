import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIsMobile } from "./use-mobile";
import { usePermission } from "./use-permission";

export interface UserMediaOptions {
  audioDeviceId?: string;
  videoDeviceId?: string;
}

export interface UserMediaState {
  isLoading: boolean;
  error: Error | null;
  audioEnabled: boolean;
  videoEnabled: boolean;
  mediaStream: MediaStream | null;
}

export function useUserMedia(options: UserMediaOptions) {
  const isMobile = useIsMobile();
  const {
    state: cameraPermission,
    requestPermission: requestCameraPermission,
  } = usePermission("camera");

  const {
    state: microphonePermission,
    requestPermission: requestMicPermission,
  } = usePermission("microphone");

  const [state, setState] = useState<UserMediaState>({
    error: null,
    isLoading: true,
    mediaStream: null,
    audioEnabled: false,
    videoEnabled: false,
  });

  const mediaStreamRef = useRef<MediaStream | null>(null);

  const getUserMedia = useCallback(async () => {
    if (cameraPermission !== "granted" && microphonePermission !== "granted") {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        mediaStream: null,
        error: new Error("No permission"),
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
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
              ? {
                  deviceId: { exact: options.videoDeviceId },
                  aspectRatio: { ideal: isMobile ? 1 : 16 / 9 },
                }
              : true
            : false,
      };

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = mediaStream;

      setState({
        mediaStream,
        error: null,
        isLoading: false,
        audioEnabled: !!mediaStream.getAudioTracks()[0]?.enabled,
        videoEnabled: !!mediaStream.getVideoTracks()[0]?.enabled,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        mediaStream: null,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to get user media"),
      }));
    }
  }, [
    isMobile,
    cameraPermission,
    microphonePermission,
    options.audioDeviceId,
    options.videoDeviceId,
  ]);

  useEffect(() => {
    void getUserMedia();
  }, [getUserMedia]);

  const toggleAudioEnabled = useCallback(() => {
    if (microphonePermission !== "granted") {
      requestMicPermission();
      return;
    }

    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        audioTrack.dispatchEvent(new Event("enabledchange"));

        setState((prev) => ({
          ...prev,
          audioEnabled: audioTrack.enabled,
        }));
      }
    }
  }, [microphonePermission, requestMicPermission]);

  const toggleVideoEnabled = useCallback(() => {
    if (cameraPermission !== "granted") {
      requestCameraPermission();
      return;
    }

    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        videoTrack.dispatchEvent(new Event("enabledchange"));

        setState((prev) => ({
          ...prev,
          videoEnabled: videoTrack.enabled,
        }));
      }
    }
  }, [cameraPermission, requestCameraPermission]);

  const stopUserMedia = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      mediaStreamRef.current = null;
    }

    setState({
      error: null,
      audioEnabled: false,
      videoEnabled: false,
      isLoading: false,
      mediaStream: null,
    });
  }, []);

  const userMedia = useMemo(() => {
    return {
      ...state,
      stopUserMedia,
      toggleAudioEnabled,
      toggleVideoEnabled,
    };
  }, [state, toggleAudioEnabled, toggleVideoEnabled, stopUserMedia]);

  return userMedia;
}
