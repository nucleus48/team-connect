import { useEffect, useEffectEvent, useState } from "react";
import { usePermission } from "./use-permission";

interface MediaDevicesState {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
}

export function useMediaDevices() {
  const { state: cameraPermission } = usePermission("camera");
  const { state: microphonePermission } = usePermission("microphone");
  const [devices, setDevices] = useState<MediaDevicesState>({
    cameras: [],
    speakers: [],
    microphones: [],
  });

  const enumerateDevices = useEffectEvent(
    (kind: MediaDeviceKind, mediaDevices: MediaDeviceInfo[]) => {
      const devices = new Map<string, MediaDeviceInfo>();

      mediaDevices.forEach((device) => {
        if (devices.has(device.groupId)) return;
        if (
          device.kind === kind &&
          device.groupId &&
          device.label &&
          device.deviceId
        ) {
          devices.set(device.groupId, device);
        }
      });

      return Array.from(devices.values());
    },
  );

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
        const cameras = enumerateDevices("videoinput", allDevices);
        const speakers = enumerateDevices("audiooutput", allDevices);
        const microphones = enumerateDevices("audioinput", allDevices);

        if (!controller.signal.aborted) {
          setDevices({
            cameras,
            speakers,
            microphones,
          });
        }
      } catch {
        void 0;
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
