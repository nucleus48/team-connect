"use client";

import { createContext, use, useEffect, useReducer, useState } from "react";
import { toast } from "sonner";
import { useMediaDevices } from "../hooks/use-media-devices";

export type UserMediaContextValue = {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  toggleAudioEnabled: React.ActionDispatch<[]>;
  toggleVideoEnabled: React.ActionDispatch<[]>;
  setAudioDeviceId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setVideoDeviceId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const UserMediaContext = createContext<UserMediaContextValue | null>(null);

export default function UserMediaProvider({
  children,
}: React.PropsWithChildren) {
  const [audioDeviceId, setAudioDeviceId] = useState<string>();
  const [videoDeviceId, setVideoDeviceId] = useState<string>();
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack>();
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack>();
  const [isAudioEnabled, toggleAudioEnabled] = useReducer((t) => !t, true);
  const [isVideoEnabled, toggleVideoEnabled] = useReducer((t) => !t, true);

  const devices = useMediaDevices();

  useEffect(() => () => void audioTrack?.stop(), [audioTrack]);
  useEffect(() => () => void videoTrack?.stop(), [videoTrack]);

  useEffect(() => {
    async function getUserVideoMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: videoDeviceId },
        });

        setVideoTrack(stream.getVideoTracks()[0]);
      } catch {
        toast.error("Failed to get video device");
      }
    }

    if (isVideoEnabled) {
      getUserVideoMedia();
    } else {
      setVideoTrack(undefined);
    }
  }, [isVideoEnabled, videoDeviceId]);

  useEffect(() => {
    async function getUserAudioMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: audioDeviceId },
        });

        setAudioTrack(stream.getAudioTracks()[0]);
      } catch {
        toast.error("Failed to get audio device");
      }
    }

    getUserAudioMedia();
  }, [audioDeviceId]);

  useEffect(() => {
    if (audioTrack) {
      audioTrack.enabled = isAudioEnabled;
    }
  }, [isAudioEnabled, audioTrack]);

  useEffect(() => {
    setAudioDeviceId((deviceId) => {
      const existing =
        !deviceId || devices.some((device) => device.deviceId === deviceId);

      return existing ? deviceId : undefined;
    });

    setVideoDeviceId((deviceId) => {
      const existing =
        !deviceId || devices.some((device) => device.deviceId === deviceId);

      return existing ? deviceId : undefined;
    });
  }, [devices]);

  return (
    <UserMediaContext
      value={{
        audioTrack,
        videoTrack,
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
