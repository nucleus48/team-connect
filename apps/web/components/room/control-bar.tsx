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
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";
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
    <div className="flex items-center justify-center gap-4 border-t border-white/10 bg-zinc-900/90 px-6 py-3 shadow-2xl backdrop-blur-xl">
      <TooltipProvider delayDuration={0}>
        <MicToggle />
        <CameraToggle />
        <SpeakerSetting className="hidden sm:flex" />

        <Control
          activeIcon={Share01Icon}
          inactiveIcon={Share01Icon}
          onClick={
            displayMedia.mediaStream
              ? displayMedia.stopDisplayMedia
              : displayMedia.startDisplayMedia
          }
          isActive={!!displayMedia.mediaStream}
          variant={displayMedia.mediaStream ? "accent" : "secondary"}
          label={displayMedia.mediaStream ? "Stop sharing" : "Share screen"}
        />

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

interface ControlProps {
  label: string;
  onClick: () => void;
  isActive: boolean;
  activeIcon: IconSvgElement;
  inactiveIcon: IconSvgElement;
  variant?: "secondary" | "accent";
}

function Control({
  label,
  onClick,
  isActive,
  activeIcon,
  inactiveIcon,
  variant = "secondary",
}: ControlProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={
            variant === "accent"
              ? isActive
                ? "default"
                : "secondary"
              : isActive
                ? "secondary"
                : "destructive"
          }
          size="icon"
          className="size-12 rounded-full transition-all duration-200"
          onClick={onClick}
        >
          <HugeiconsIcon
            icon={isActive ? activeIcon : inactiveIcon}
            className="size-5"
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
