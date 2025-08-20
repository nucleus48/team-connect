import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MonitorPauseIcon, ScreenShareIcon } from "lucide-react";
import { useDisplayMedia } from "../../providers/display-media-provider";

export default function ScreenShare({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { shareScreen, isSharingScreen, stopScreenSharing } = useDisplayMedia();

  if (isSharingScreen) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button size={"icon"} className={cn("rounded-full", className)}>
            <MonitorPauseIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="space-y-2 p-0 px-2 py-2">
          <Button size={"sm"} variant={"ghost"} onClick={shareScreen}>
            Share a different screen
          </Button>
          <Button size={"sm"} variant={"ghost"} onClick={stopScreenSharing}>
            Stop screen sharing
          </Button>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Button
      size="icon"
      onClick={shareScreen}
      variant={"secondary"}
      className={cn("rounded-full", className)}
      {...props}
    >
      <ScreenShareIcon />
    </Button>
  );
}
