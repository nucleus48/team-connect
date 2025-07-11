"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

export type VideoProps = React.ComponentProps<"video"> & {
  mediaStream: MediaStream;
};

export default function Video({
  children,
  className,
  mediaStream,
  ...props
}: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = mediaStream;
  }, [mediaStream]);

  return (
    <div className="overflow-hidden rounded-xl">
      <video
        autoPlay
        ref={videoRef}
        className={cn(className, "size-full object-cover")}
        {...props}
      />
      {children}
    </div>
  );
}
