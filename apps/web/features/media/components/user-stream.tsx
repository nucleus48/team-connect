"use client";

import { VideoHTMLAttributes } from "react";
import { useProduceStream } from "../hooks/use-produce-stream";

export type UserStreamProps = VideoHTMLAttributes<HTMLVideoElement> & {
  stream: MediaStream;
};

export default function UserStream({ stream, ...props }: UserStreamProps) {
  const videoRef = useProduceStream(stream);

  return <video autoPlay muted ref={videoRef} {...props}></video>;
}
