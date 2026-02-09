"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaDevices } from "@/hooks/use-media-devices";
import { cn } from "@/lib/utils";
import { useLocalMedia } from "@/providers/local-media-provider";
import {
  ArrowDown01Icon,
  Camera01Icon,
  CameraOff01Icon,
  Mic01Icon,
  MicOff01Icon,
  Speaker01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function MicSelector({ className }: { className?: string }) {
  const { microphones } = useMediaDevices();
  const { selectedAudioInput, setSelectedAudioInput } = useLocalMedia();

  return (
    <Select value={selectedAudioInput} onValueChange={setSelectedAudioInput}>
      <SelectTrigger className={className}>
        <HugeiconsIcon icon={Mic01Icon} className="mr-2 size-3" />
        <SelectValue placeholder="Microphone" />
      </SelectTrigger>
      <SelectContent>
        {microphones.map((d: MediaDeviceInfo) => (
          <SelectItem key={d.deviceId} value={d.deviceId}>
            {d.label || `Microphone ${d.deviceId.slice(0, 5)}...`}
          </SelectItem>
        ))}
        {microphones.length === 0 && (
          <SelectItem value="default" disabled>
            No microphones found
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}

export function SpeakerSelector({ className }: { className?: string }) {
  const { speakers } = useMediaDevices();
  const { selectedAudioOutput, setSelectedAudioOutput } = useLocalMedia();

  return (
    <Select value={selectedAudioOutput} onValueChange={setSelectedAudioOutput}>
      <SelectTrigger className={className}>
        <HugeiconsIcon icon={Speaker01Icon} className="mr-2 size-3" />
        <SelectValue placeholder="Speaker" />
      </SelectTrigger>
      <SelectContent>
        {speakers.map((d: MediaDeviceInfo) => (
          <SelectItem key={d.deviceId} value={d.deviceId}>
            {d.label || `Speaker ${d.deviceId.slice(0, 5)}...`}
          </SelectItem>
        ))}
        {speakers.length === 0 && (
          <SelectItem value="default" disabled>
            Default Speaker
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}

export function CameraSelector({ className }: { className?: string }) {
  const { cameras } = useMediaDevices();
  const { selectedVideoInput, setSelectedVideoInput } = useLocalMedia();

  return (
    <Select value={selectedVideoInput} onValueChange={setSelectedVideoInput}>
      <SelectTrigger className={className}>
        <HugeiconsIcon icon={Camera01Icon} className="mr-2 size-3" />
        <SelectValue placeholder="Camera" />
      </SelectTrigger>
      <SelectContent>
        {cameras.map((d: MediaDeviceInfo) => (
          <SelectItem key={d.deviceId} value={d.deviceId}>
            {d.label || `Camera ${d.deviceId.slice(0, 5)}...`}
          </SelectItem>
        ))}
        {cameras.length === 0 && (
          <SelectItem value="default" disabled>
            No cameras found
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}

export function MicToggle({ className }: { className?: string }) {
  const { microphones } = useMediaDevices();
  const { userMedia, selectedAudioInput, setSelectedAudioInput } =
    useLocalMedia();

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex items-center rounded-full shadow-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={() => void userMedia.toggleAudioEnabled()}
              variant={!userMedia.isAudioEnabled ? "destructive" : "secondary"}
              className={cn(
                "size-12 rounded-full sm:rounded-l-full sm:rounded-r-none sm:border-r",
                className,
              )}
            >
              <HugeiconsIcon
                icon={!userMedia.isAudioEnabled ? MicOff01Icon : Mic01Icon}
                className="size-5"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{userMedia.isAudioEnabled ? "Mute" : "Unmute"}</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={
                    !userMedia.isAudioEnabled ? "destructive" : "secondary"
                  }
                  size="icon"
                  className="hidden h-12 w-8 rounded-l-none rounded-r-full sm:flex"
                >
                  <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Microphone settings</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuRadioGroup
              value={selectedAudioInput}
              onValueChange={setSelectedAudioInput}
            >
              {microphones.map((d) => (
                <DropdownMenuRadioItem key={d.deviceId} value={d.deviceId}>
                  {d.label || "Microphone"}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}

export function CameraToggle({ className }: { className?: string }) {
  const { userMedia, selectedVideoInput, setSelectedVideoInput } =
    useLocalMedia();
  const { cameras } = useMediaDevices();

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex items-center rounded-full shadow-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={!userMedia.isVideoEnabled ? "destructive" : "secondary"}
              size="icon"
              className={cn(
                "size-12 rounded-full sm:rounded-l-full sm:rounded-r-none sm:border-r",
                className,
              )}
              onClick={() => void userMedia.toggleVideoEnabled()}
            >
              <HugeiconsIcon
                icon={
                  !userMedia.isVideoEnabled ? CameraOff01Icon : Camera01Icon
                }
                className="size-5"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {userMedia.isVideoEnabled ? "Turn off camera" : "Turn on camera"}
            </p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={
                    !userMedia.isVideoEnabled ? "destructive" : "secondary"
                  }
                  size="icon"
                  className="hidden h-12 w-8 rounded-l-none rounded-r-full sm:flex"
                >
                  <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Camera settings</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuRadioGroup
              value={selectedVideoInput}
              onValueChange={setSelectedVideoInput}
            >
              {cameras.map((d) => (
                <DropdownMenuRadioItem key={d.deviceId} value={d.deviceId}>
                  {d.label || "Camera"}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}

export function SpeakerSetting({ className }: { className?: string }) {
  const { selectedAudioOutput, setSelectedAudioOutput } = useLocalMedia();
  const { speakers } = useMediaDevices();

  return (
    <TooltipProvider delayDuration={0}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className={cn("size-12 rounded-full", className)}
              >
                <HugeiconsIcon icon={Speaker01Icon} className="size-5" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Speaker settings</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuRadioGroup
            value={selectedAudioOutput}
            onValueChange={setSelectedAudioOutput}
          >
            {speakers.map((d) => (
              <DropdownMenuRadioItem key={d.deviceId} value={d.deviceId}>
                {d.label || "Speaker"}
              </DropdownMenuRadioItem>
            ))}
            {speakers.length === 0 && (
              <DropdownMenuRadioItem value="default" disabled>
                Default Speaker
              </DropdownMenuRadioItem>
            )}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
