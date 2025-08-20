"use client";

import { usePermission } from "@/hooks/use-permission";
import { createContext, use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useMediaDevices } from "../hooks/use-media-devices";

export type UserMediaContextValue = {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  setAudioDeviceGroupId: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  setVideoDeviceGroupId: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  setAudioEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setVideoEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  enableAudioPermission: () => Promise<void>;
  enableVideoPermission: () => Promise<void>;
};

const UserMediaContext = createContext<UserMediaContextValue | null>(null);

export default function UserMediaProvider({
  children,
}: React.PropsWithChildren) {
  const [isAudioEnabled, setAudioEnabled] = useState(true);
  const [isVideoEnabled, setVideoEnabled] = useState(true);
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack>();
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack>();
  const [audioDeviceGroupId, setAudioDeviceGroupId] = useState<string>();
  const [videoDeviceGroupId, setVideoDeviceGroupId] = useState<string>();

  const cameraPermission = usePermission("camera");
  const microphonePermission = usePermission("microphone");
  const { audioDevices, videoDevices } = useMediaDevices();

  useEffect(() => () => audioTrack?.stop(), [audioTrack]);
  useEffect(() => {
    videoTrack?.addEventListener("ended", () => {
      location.reload();
    });

    return () => {
      videoTrack?.stop();
    };
  }, [videoTrack]);

  const enableAudioPermission = useCallback(async () => {
    if (microphonePermission !== "granted") {
      toast.info("Microphone permission", {
        id: "microphone-permission",
        description: "We need to access your mic",
        closeButton: true,
        duration: Infinity,
        action: {
          label: "Grant",
          onClick: () => {
            toast.promise(
              async () => {
                const stream = await navigator.mediaDevices.getUserMedia({
                  audio: true,
                });
                stream.getTracks().forEach((track) => track.stop());
                setAudioEnabled(true);
              },
              {
                id: "promise-microphone-permission",
                loading: "Microphone permission",
                error: "Failed to access microphone",
              },
            );
          },
        },
      });
    }
  }, [microphonePermission]);

  const enableVideoPermission = useCallback(async () => {
    if (cameraPermission !== "granted") {
      toast.info("Camera permission", {
        id: "camera-permission",
        description: "We need to access your camera",
        closeButton: true,
        duration: Infinity,
        action: {
          label: "Grant",
          onClick: () => {
            toast.promise(
              async () => {
                const stream = await navigator.mediaDevices.getUserMedia({
                  video: true,
                });
                stream.getTracks().forEach((track) => track.stop());
                setAudioEnabled(true);
              },
              {
                id: "promise-camera-permission",
                loading: "Camera permission",
                error: "Failed to access camera",
              },
            );
          },
        },
      });
    }
  }, [cameraPermission]);

  useEffect(() => {
    let isMounted = true;

    async function getUserVideoMedia() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          groupId: videoDeviceGroupId,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      const track = stream.getVideoTracks()[0];

      if (isMounted) {
        setVideoTrack(track);
      } else {
        track.stop();
      }
    }

    if (isVideoEnabled && cameraPermission === "granted") {
      getUserVideoMedia();
    } else {
      setVideoTrack(undefined);
    }

    return () => {
      isMounted = false;
    };
  }, [isVideoEnabled, videoDeviceGroupId, cameraPermission]);

  useEffect(() => {
    async function getUserAudioMedia() {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { groupId: audioDeviceGroupId },
      });

      setAudioTrack(stream.getAudioTracks()[0]);
    }

    if (microphonePermission === "granted") getUserAudioMedia();
  }, [audioDeviceGroupId, microphonePermission]);

  useEffect(() => {
    setAudioDeviceGroupId((groupId) => {
      const existing = audioDevices.some(
        (device) => device.groupId === groupId,
      );
      return existing ? groupId : undefined;
    });
  }, [audioDevices]);

  useEffect(() => {
    setVideoDeviceGroupId((groupId) => {
      const existing = videoDevices.some(
        (device) => device.groupId === groupId,
      );
      return existing ? groupId : undefined;
    });
  }, [videoDevices]);

  return (
    <UserMediaContext
      value={{
        audioTrack,
        videoTrack,
        isAudioEnabled,
        isVideoEnabled,
        setAudioEnabled,
        setVideoEnabled,
        setAudioDeviceGroupId,
        setVideoDeviceGroupId,
        enableAudioPermission,
        enableVideoPermission,
      }}
    >
      {children}
    </UserMediaContext>
  );
}

export const useUserMedia = () => use(UserMediaContext)!;
