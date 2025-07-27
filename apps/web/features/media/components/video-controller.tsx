import { Button } from "@/components/ui/button";
import { VideoIcon, VideoOffIcon } from "lucide-react";
import { useEffect, useReducer, useState } from "react";
import { toast } from "sonner";
import { useMediaDevices } from "../hooks/use-media-devices";
import { useUserMedia } from "../providers/user-media-provider";

export default function VideoController() {
  const [isEnabled, toggleEnabled] = useReducer((t) => !t, true);
  const [deviceId, setDeviceId] = useState<string>();

  const { setVideoTrack } = useUserMedia();
  const devices = useMediaDevices();

  useEffect(() => {
    let isMounted = true;

    async function getUserVideoMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId },
        });

        const track = stream.getVideoTracks()[0];

        if (isMounted) {
          setVideoTrack(track);
        } else {
          track.stop();
        }
      } catch {
        toast.error("Failed to get video device");
      }
    }

    if (isEnabled) {
      getUserVideoMedia();
    } else {
      setVideoTrack(undefined);
    }

    return () => {
      isMounted = false;
    };
  }, [isEnabled, deviceId, setVideoTrack]);

  useEffect(() => {
    setDeviceId((deviceId) => {
      const existing =
        !deviceId || devices.some((device) => device.deviceId === deviceId);

      return existing ? deviceId : undefined;
    });
  }, [devices]);

  return (
    <Button onClick={toggleEnabled}>
      {isEnabled ? <VideoIcon /> : <VideoOffIcon />}
    </Button>
  );
}
