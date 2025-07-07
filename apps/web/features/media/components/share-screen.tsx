"use client";

import { Button } from "@/components/ui/button";
import { useMedia } from "../providers/media-provider";

export default function ShareScreen() {
  const { addDisplayStream } = useMedia();

  return (
    <Button onClick={() => addDisplayStream?.({ audio: true, video: true })}>
      Share Screen
    </Button>
  );
}
