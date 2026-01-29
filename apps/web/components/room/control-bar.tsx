"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocalMedia } from "@/providers/local-media-provider";
import { useRoom } from "@/providers/room-provider";
import { CallEnd01Icon, Share01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { CameraToggle, MicToggle, SpeakerSetting } from "./device-settings";

export default function ControlBar() {
  const { leaveRoom } = useRoom();
  const { userMedia, displayMedia } = useLocalMedia();

  const handleLeave = () => {
    userMedia.stopUserMedia();
    displayMedia.stopDisplayMedia();
    leaveRoom();
  };

  return (
    <div className="flex items-center justify-center gap-4 bg-zinc-900/90 px-6 py-3 shadow-2xl backdrop-blur-xl">
      <TooltipProvider delayDuration={0}>
        <MicToggle />
        <CameraToggle />
        <SpeakerSetting className="hidden shadow-lg sm:flex" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={displayMedia.mediaStream ? "default" : "secondary"}
              size="icon"
              className="size-12 rounded-full transition-all duration-200"
              onClick={
                displayMedia.mediaStream
                  ? displayMedia.stopDisplayMedia
                  : displayMedia.startDisplayMedia
              }
            >
              <HugeiconsIcon icon={Share01Icon} className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{displayMedia.mediaStream ? "Stop sharing" : "Share screen"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="destructive"
              onClick={handleLeave}
              className="size-12 rounded-full bg-red-600 shadow-lg"
            >
              <HugeiconsIcon icon={CallEnd01Icon} className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Leave call</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
