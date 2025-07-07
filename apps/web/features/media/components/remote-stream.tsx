"use client";

import { VideoHTMLAttributes } from "react";
import { useConsumeStream } from "../hooks/use-consume-stream";
import { type RemoteStream } from "../providers/transport-provider";

export type RemoteStreamProps = VideoHTMLAttributes<HTMLVideoElement> & {
  remoteStream: RemoteStream;
};

export default function RemoteStream({
  remoteStream,
  ...props
}: RemoteStreamProps) {
  const videoRef = useConsumeStream(remoteStream);

  return <video autoPlay ref={videoRef} {...props}></video>;
}
