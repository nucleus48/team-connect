import { Button } from "@/components/ui/button";
import { MicIcon, MicOffIcon } from "lucide-react";
import { useEffect, useReducer, useState } from "react";
import { toast } from "sonner";
import { useMediaDevices } from "../hooks/use-media-devices";
import { useUserMedia } from "../providers/user-media-provider";

export default function AudioController() {
  const [isEnabled, toggleEnabled] = useReducer((t) => !t, true);
  const [deviceId, setDeviceId] = useState<string>();

  const { setAudioTrack, audioTrack } = useUserMedia();
  const devices = useMediaDevices();

  useEffect(() => {
    let isMounted = true;

    async function getUserAudioMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId },
        });

        const track = stream.getAudioTracks()[0];

        if (isMounted) {
          setAudioTrack(track);
        } else {
          track.stop();
        }
      } catch {
        toast.error("Failed to get audio device");
      }
    }

    getUserAudioMedia();

    return () => {
      isMounted = false;
    };
  }, [deviceId, setAudioTrack]);

  useEffect(() => {
    if (audioTrack) {
      audioTrack.enabled = isEnabled;
    }
  }, [isEnabled, audioTrack]);

  useEffect(() => {
    setDeviceId((deviceId) => {
      const existing =
        !deviceId || devices.some((device) => device.deviceId === deviceId);

      return existing ? deviceId : undefined;
    });
  }, [devices]);

  return (
    <Button onClick={toggleEnabled}>
      {isEnabled ? <MicIcon /> : <MicOffIcon />}
    </Button>
  );
}
