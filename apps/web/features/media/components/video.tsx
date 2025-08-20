"use client";

import { cn } from "@/lib/utils";
import { MicOffIcon } from "lucide-react";
import React, { useEffect, useMemo, useRef } from "react";

export type VideoMode = "fullscreen" | "picture-in-picture" | "normal";

export type VideoProps = Omit<
  React.ComponentPropsWithoutRef<"video">,
  "children"
> & {
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  containerClassName?: string;
  audioEnabled?: boolean;
  mode?: VideoMode;
  flip?: boolean;
};

export default function Video({
  flip,
  className,
  audioTrack,
  videoTrack,
  audioEnabled,
  mode = "normal",
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
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-black",
        // pictureInPicture && "h-0",
        containerClassName,
      )}
    >
      <video
        autoPlay
        ref={videoRef}
        className={cn(
          "size-full",
          !videoTrack && "opacity-0",
          flip && "rotate-y-180",
          className,
        )}
        {...props}
      />
      {!audioEnabled && (
        <MicOffIcon className="absolute top-2 right-2 size-4 text-white" />
      )}
    </div>
  );
}
