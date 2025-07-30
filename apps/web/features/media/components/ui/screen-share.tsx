import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";
import { useDisplayMedia } from "../../providers/display-media-provider";
import { MonitorPauseIcon, ScreenShareIcon } from "lucide-react";

export default function ScreenShare({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { shareScreen, isSharingScreen } = useDisplayMedia();

  return (
    <Button
      size="icon"
      variant={"secondary"}
      onClick={shareScreen}
      className={cn("rounded-full", className)}
      {...props}
    >
      {isSharingScreen ? <MonitorPauseIcon /> : <ScreenShareIcon />}
    </Button>
  );
}
