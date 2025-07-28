"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useMemo, useRef } from "react";

export type VideoProps = React.ComponentProps<"video"> & {
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
};

export default function Video({
  children,
  className,
  audioTrack,
  videoTrack,
  ...props
}: VideoProps) {
  const stream = useMemo(() => new MediaStream(), []);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    if (audioTrack) {
      stream.addTrack(audioTrack);
      return () => stream.removeTrack(audioTrack);
    }
  }, [stream, audioTrack]);

  useEffect(() => {
    if (videoTrack) {
      stream.addTrack(videoTrack);
      return () => stream.removeTrack(videoTrack);
    }
  }, [stream, videoTrack]);

  return (
    <div>
      <video
        autoPlay
        ref={videoRef}
        className={cn(
          className,
          "size-full rounded-xl object-cover",
          videoTrack ? "opacity-100" : "opacity-0",
        )}
        {...props}
      />
      {children}
    </div>
  );
}
