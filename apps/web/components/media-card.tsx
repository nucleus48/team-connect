import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export interface MediaCardProps extends React.ComponentProps<"video"> {
  mediaStream: MediaStream | null;
}

export default function MediaCard({
  mediaStream,
  className,
  ...props
}: MediaCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  return (
    <video
      autoPlay
      playsInline
      ref={videoRef}
      className={cn("h-full w-full", className)}
      {...props}
    />
  );
}
