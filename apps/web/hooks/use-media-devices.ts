import { useEffect, useState } from "react";
import { usePermission } from "./use-permission";

interface MediaDevicesState {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  isLoading: boolean;
}

export function useMediaDevices() {
  const { state: cameraPermission } = usePermission("camera");
  const { state: microphonePermission } = usePermission("microphone");
  const [devices, setDevices] = useState<MediaDevicesState>({
    cameras: [],
    speakers: [],
    microphones: [],
    isLoading: true,
  });

  useEffect(() => {
    const controller = new AbortController();

    const getDevices = async () => {
      if (
        cameraPermission !== "granted" &&
        microphonePermission !== "granted"
      ) {
        setDevices((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const cameras = allDevices.filter(
          (d) => d.kind === "videoinput" && d.deviceId && d.label,
        );
        const speakers = allDevices.filter(
          (d) => d.kind === "audiooutput" && d.deviceId && d.label,
        );
        const microphones = allDevices.filter(
          (d) => d.kind === "audioinput" && d.deviceId && d.label,
        );

        if (!controller.signal.aborted) {
          setDevices({
            cameras,
            speakers,
            microphones,
            isLoading: false,
          });
        }
      } catch {
        setDevices((prev) => ({ ...prev, isLoading: false }));
      }
    };

    void getDevices();

    navigator.mediaDevices.addEventListener(
      "devicechange",
      () => {
        void getDevices();
      },
      { signal: controller.signal },
    );

    return () => {
      controller.abort();
    };
  }, [cameraPermission, microphonePermission]);

  return devices;
}
