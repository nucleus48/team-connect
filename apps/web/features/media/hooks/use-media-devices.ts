"use client";

import { useEffect, useState } from "react";

export const useMediaDevices = () => {
  const [mediaDevices, setMediaDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    async function enumerateDevices() {
      try {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        setMediaDevices(mediaDevices);
      } catch (error) {
        console.error('Failed to enumerate media devices:', error);
        setMediaDevices([]);
      }
    }

    enumerateDevices();
    navigator.mediaDevices.addEventListener("devicechange", enumerateDevices);

    return () =>
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        enumerateDevices,
      );
  }, []);

  return mediaDevices;
};
