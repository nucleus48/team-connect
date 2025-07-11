"use client";

import { Button } from "@/components/ui/button";
import { VideoIcon, VideoOffIcon } from "lucide-react";
import { useUserMedia } from "../providers/user-media-provider";

export default function ToggleVideo() {
  const { isVideoEnabled, toggleVideoEnabled } = useUserMedia();

  return (
    <Button variant="ghost" size="icon" onClick={toggleVideoEnabled}>
      {isVideoEnabled ? <VideoIcon /> : <VideoOffIcon />}
    </Button>
  );
}
