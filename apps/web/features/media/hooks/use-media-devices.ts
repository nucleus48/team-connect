"use client";

import { useEffect, useState } from "react";

export const useMediaDevices = () => {
  const [mediaDevices, setMediaDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    async function enumerateDevices() {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      setMediaDevices(mediaDevices);
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
