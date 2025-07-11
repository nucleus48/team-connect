"use client";

import { Button } from "@/components/ui/button";
import { ScreenShareIcon } from "lucide-react";
import { useDisplayMedia } from "../providers/display-media-provider";

export default function ShareScreen() {
  const { addDisplayMedia } = useDisplayMedia();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => addDisplayMedia({ audio: true, video: true })}
    >
      <ScreenShareIcon />
    </Button>
  );
}
