import { tryCatch } from "@/lib/utils";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useIsMobile } from "./use-mobile";
import { usePermission } from "./use-permission";

export interface UserMediaOptions {
  audioDeviceId?: string;
  videoDeviceId?: string;
}

const getMediaStream = () => {
  if (typeof window === "undefined") return {} as MediaStream;
  return new MediaStream();
};

export function useUserMedia(options: UserMediaOptions) {
  const isMobile = useIsMobile();
  const mediaStream = useState(getMediaStream)[0];
  const [isAudioLoading, setAudioLoading] = useState(false);
  const [isVideoLoading, setVideoLoading] = useState(false);
  const [audioError, setAudioError] = useState<Error | null>(null);
  const [videoError, setVideoError] = useState<Error | null>(null);
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);

  const {
    state: cameraPermission,
    requestPermission: requestCameraPermission,
  } = usePermission("camera");

  const {
    state: microphonePermission,
    requestPermission: requestMicPermission,
  } = usePermission("microphone");

  const controllerRef = useRef<AbortController>(null);

  const stopAndDetachTrack = (track: MediaStreamTrack) => {
    try {
      track.stop();
      mediaStream.removeTrack(track);
    } catch {
      void 0;
    }

    if (track.kind === "audio") {
      setAudioTrack(null);
    } else if (track.kind === "video") {
      setVideoTrack(null);
    }
  };

  const attachTrack = (track: MediaStreamTrack) => {
    try {
      mediaStream.addTrack(track);
    } catch {
      void 0;
    }

    if (track.kind === "audio") {
      setAudioTrack(track);
    } else if (track.kind === "video") {
      setVideoTrack(track);
    }

    controllerRef.current ??= new AbortController();
    const { signal } = controllerRef.current;

    track.addEventListener("ended", stopAndDetachTrack.bind(null, track), {
      signal,
    });
  };

  const getAudioTrack = async () => {
    if (audioTrack) return;

    setAudioError(null);
    setAudioLoading(true);

    if (microphonePermission !== "granted") {
      const { success } = await tryCatch(requestMicPermission());

      if (!success) {
        setAudioLoading(false);
        setAudioError(new Error("Microphone permission denied"));
        return;
      }
    }

    const { success, data } = await tryCatch(
      navigator.mediaDevices.getUserMedia({
        audio: options.audioDeviceId
          ? { deviceId: { exact: options.audioDeviceId } }
          : true,
      }),
    );

    setAudioLoading(false);

    if (!success) {
      setAudioError(new Error("Failed to get audio track"));
      return;
    }

    const track = data.getAudioTracks()[0];

    if (!track) {
      setAudioError(new Error("Failed to get audio track"));
      return;
    }

    attachTrack(track);
  };

  const getVideoTrack = async () => {
    if (videoTrack) return;

    setVideoError(null);
    setVideoLoading(true);

    if (cameraPermission !== "granted") {
      const { success } = await tryCatch(requestCameraPermission());

      if (!success) {
        setVideoLoading(false);
        setVideoError(new Error("Camera permission denied"));
        return;
      }
    }

    const { success, data } = await tryCatch(
      navigator.mediaDevices.getUserMedia({
        video: options.videoDeviceId
          ? {
              deviceId: { exact: options.videoDeviceId },
              aspectRatio: { ideal: isMobile ? 9 / 16 : 16 / 9 },
            }
          : { aspectRatio: { ideal: isMobile ? 9 / 16 : 16 / 9 } },
      }),
    );

    setVideoLoading(false);

    if (!success) {
      setVideoError(new Error("Failed to get video track"));
      return;
    }

    const track = data.getVideoTracks()[0];

    if (!track) {
      setVideoError(new Error("Failed to get video track"));
      return;
    }

    attachTrack(track);
  };

  const toggleAudioEnabled = async () => {
    if (audioTrack) {
      stopAndDetachTrack(audioTrack);
    } else {
      await getAudioTrack();
    }
  };

  const toggleVideoEnabled = async () => {
    if (videoTrack) {
      stopAndDetachTrack(videoTrack);
    } else {
      await getVideoTrack();
    }
  };

  const stopUserMedia = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    mediaStream.getTracks().forEach((track) => {
      mediaStream.removeTrack(track);
      track.stop();
    });

    setAudioError(null);
    setVideoError(null);
    setAudioTrack(null);
    setVideoTrack(null);
  };

  const getUserMedia = useEffectEvent(async () => {
    await getAudioTrack();
    await getVideoTrack();
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      void getUserMedia();
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!options.audioDeviceId || !audioTrack) return;

    void tryCatch(
      audioTrack.applyConstraints({
        deviceId: { exact: options.audioDeviceId },
      }),
    );
  }, [options.audioDeviceId, audioTrack]);

  useEffect(() => {
    if (!options.videoDeviceId || !videoTrack) return;

    void tryCatch(
      videoTrack.applyConstraints({
        deviceId: { exact: options.videoDeviceId },
        aspectRatio: isMobile ? 9 / 16 : 16 / 9,
      }),
    );
  }, [options.videoDeviceId, isMobile, videoTrack]);

  return {
    audioError,
    videoError,
    audioTrack,
    videoTrack,
    mediaStream,
    stopUserMedia,
    isAudioLoading,
    isVideoLoading,
    toggleAudioEnabled,
    toggleVideoEnabled,
    isAudioEnabled: !!audioTrack?.enabled,
    isVideoEnabled: !!videoTrack?.enabled,
  };
}
