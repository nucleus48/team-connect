"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useMemo, useRef } from "react";

export type VideoProps = React.ComponentProps<"video"> & {
  containerClassName?: string;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
};

export default function Video({
  children,
  className,
  audioTrack,
  videoTrack,
  containerClassName,
  ...props
}: VideoProps) {
  const stream = useMemo(() => {
    return typeof window === "undefined" ? null : new MediaStream();
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    if (audioTrack && stream) {
      stream.addTrack(audioTrack);
      return () => stream.removeTrack(audioTrack);
    }
  }, [stream, audioTrack]);

  useEffect(() => {
    if (videoTrack && stream) {
      stream.addTrack(videoTrack);
      return () => stream.removeTrack(videoTrack);
    }
  }, [stream, videoTrack]);

  return (
    <div className={cn("relative min-w-min", containerClassName)}>
      <video
        autoPlay
        ref={videoRef}
        className={cn(
          "h-full rounded-2xl object-center",
          !videoTrack && "opacity-0",
          className,
        )}
        {...props}
      />
      {children}
    </div>
  );
}
