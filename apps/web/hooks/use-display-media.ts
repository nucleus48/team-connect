import { useState } from "react";
import { toast } from "sonner";

export function useDisplayMedia() {
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startDisplayMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      setStream(stream);
    } catch {
      toast.error("Unable to get display");
    }
  };

  const stopDisplayMedia = () => {
    stream?.getTracks().forEach((track) => {
      track.stop();
    });

    setStream(null);
  };

  return {
    stream,
    startDisplayMedia,
    stopDisplayMedia,
  };
}
