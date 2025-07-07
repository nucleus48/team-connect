"use client";

import { VideoHTMLAttributes } from "react";
import { useProduceStream } from "../hooks/use-produce-stream";

export type DisplayStreamProps = VideoHTMLAttributes<HTMLVideoElement> & {
  stream: MediaStream;
};

export default function DisplayStream({
  stream,
  ...props
}: DisplayStreamProps) {
  const videoRef = useProduceStream(stream);

  return <video autoPlay muted ref={videoRef} {...props}></video>;
}
