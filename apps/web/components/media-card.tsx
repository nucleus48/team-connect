import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export interface MediaCardProps extends React.ComponentProps<"div"> {
  muted?: boolean;
  mediaStream: MediaStream | null;
  videoClassName?: string;
}

export default function MediaCard({
  muted,
  mediaStream,
  videoClassName,
  ...props
}: MediaCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  return (
    <div {...props}>
      <video
        autoPlay
        playsInline
        muted={muted}
        ref={videoRef}
        className={cn("h-full w-full", videoClassName)}
      />
    </div>
  );
}
