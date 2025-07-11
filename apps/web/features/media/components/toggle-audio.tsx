"use client";

import { Button } from "@/components/ui/button";
import { MicIcon, MicOffIcon } from "lucide-react";
import { useUserMedia } from "../providers/user-media-provider";

export default function ToggleAudio() {
  const { isAudioEnabled, toggleAudioEnabled } = useUserMedia();

  return (
    <Button variant="ghost" size="icon" onClick={toggleAudioEnabled}>
      {isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
    </Button>
  );
}
