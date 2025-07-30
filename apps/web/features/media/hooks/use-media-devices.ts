"use client";

import { usePermission } from "@/hooks/use-permission";
import { useCallback, useEffect, useState } from "react";

export const useMediaDevices = () => {
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const cameraPermission = usePermission("camera");
  const microphonePermission = usePermission("microphone");

  const enumerateDevices = useCallback(async (kind: MediaDeviceKind) => {
    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    const devices: Map<string, MediaDeviceInfo> = new Map();

    mediaDevices.forEach((device) => {
      if (devices.has(device.groupId)) return;
      if (device.kind === kind && !!device.groupId) {
        devices.set(device.groupId, device);
      }
    });

    return Array.from(devices.values());
  }, []);

  useEffect(() => {
    if (cameraPermission !== "granted") return;

    const handleChange = async () => {
      const devices = await enumerateDevices("videoinput");
      setVideoDevices(devices);
    };

    handleChange();
    navigator.mediaDevices.addEventListener("devicechange", handleChange);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", handleChange);
    };
  }, [cameraPermission, enumerateDevices]);

  useEffect(() => {
    if (microphonePermission !== "granted") return;

    const handleChange = async () => {
      const devices = await enumerateDevices("audioinput");
      setAudioDevices(devices);
    };

    handleChange();
    navigator.mediaDevices.addEventListener("devicechange", handleChange);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", handleChange);
    };
  }, [microphonePermission, enumerateDevices]);

  return { audioDevices, videoDevices };
};
