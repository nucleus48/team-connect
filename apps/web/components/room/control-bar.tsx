"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocalMedia } from "@/providers/local-media-provider";
import {
  CallEnd01Icon,
  Camera01Icon,
  CameraOff01Icon,
  Mic01Icon,
  MicOff01Icon,
  Share01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";
import { useRouter } from "next/navigation";

export default function ControlBar() {
  const router = useRouter();
  const { userMedia, displayMedia } = useLocalMedia();

  const handleLeave = () => {
    userMedia.stopUserMedia();
    displayMedia.stopDisplayMedia();
    router.push("/");
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-white/10 bg-zinc-900/90 px-6 py-3 shadow-2xl backdrop-blur-xl">
      <TooltipProvider delayDuration={0}>
        <Control
          label={userMedia.audioEnabled ? "Mute" : "Unmute"}
          onClick={userMedia.toggleAudioEnabled}
          isActive={userMedia.audioEnabled}
          activeIcon={Mic01Icon}
          inactiveIcon={MicOff01Icon}
        />

        <Control
          label={userMedia.videoEnabled ? "Turn off camera" : "Turn on camera"}
          onClick={userMedia.toggleVideoEnabled}
          isActive={userMedia.videoEnabled}
          activeIcon={Camera01Icon}
          inactiveIcon={CameraOff01Icon}
        />

        <Control
          label={displayMedia.mediaStream ? "Stop sharing" : "Share screen"}
          onClick={
            displayMedia.mediaStream
              ? displayMedia.stopDisplayMedia
              : displayMedia.startDisplayMedia
          }
          isActive={!!displayMedia.mediaStream}
          activeIcon={Share01Icon}
          inactiveIcon={Share01Icon}
          variant={displayMedia.mediaStream ? "accent" : "secondary"}
        />

        <div className="mx-2 h-8 w-px bg-white/10" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="size-12 rounded-full shadow-lg hover:bg-red-600"
              onClick={handleLeave}
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
