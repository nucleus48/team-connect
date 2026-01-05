"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaDevices } from "@/hooks/use-media-devices";
import { useLocalMedia } from "@/providers/local-media-provider";
import { useRoom } from "@/providers/room-provider";
import {
  Camera01Icon,
  CameraOff01Icon,
  Mic01Icon,
  MicOff01Icon,
  Speaker01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function LobbyState() {
  const { setRoomState } = useRoom();
  const { cameras, microphones, speakers } = useMediaDevices();
  const {
    videoRef,
    isAudioMuted,
    isVideoMuted,
    toggleAudio,
    toggleVideo,
    refetchMedia,
    selectedAudioInput,
    selectedAudioOutput,
    selectedVideoInput,
    setSelectedAudioInput,
    setSelectedAudioOutput,
    setSelectedVideoInput,
  } = useLocalMedia();

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      {/* Header / Logo could go here */}

      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2">
        {/* Left Column: Camera Preview */}
        <div className="flex w-full flex-col gap-4">
          <div className="group relative aspect-video overflow-hidden rounded-xl bg-zinc-900 shadow-2xl ring-1 ring-white/10">
            {/* Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full scale-x-[-1] transform object-cover transition-opacity duration-300 ${isVideoMuted ? "opacity-0" : "opacity-100"}`}
            />

            {/* Camera Off State / Placeholder */}
            {isVideoMuted && (
              <div className="text-muted-foreground absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-zinc-800 p-4">
                    <HugeiconsIcon icon={CameraOff01Icon} className="size-8" />
                  </div>
                  <p className="text-sm font-medium">Camera is off</p>
                </div>
              </div>
            )}

            {/* Overlay Controls */}
            <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 transform gap-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {/* Centered controls if we wanted them, but usually they are below */}
            </div>

            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              <Button
                variant={isAudioMuted ? "destructive" : "secondary"}
                size="icon"
                className="size-12 rounded-full shadow-lg"
                onClick={toggleAudio}
              >
                <HugeiconsIcon
                  icon={isAudioMuted ? MicOff01Icon : Mic01Icon}
                  className="size-5"
                />
              </Button>
              <Button
                variant={isVideoMuted ? "destructive" : "secondary"}
                size="icon"
                className="size-12 rounded-full shadow-lg"
                onClick={toggleVideo}
              >
                <HugeiconsIcon
                  icon={isVideoMuted ? CameraOff01Icon : Camera01Icon}
                  className="size-5"
                />
              </Button>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-xl flex-wrap justify-center gap-2">
            <Select
              value={selectedAudioInput}
              onValueChange={(val) => {
                setSelectedAudioInput(val);
                setTimeout(() => {
                  void refetchMedia();
                }, 100);
              }}
            >
              <SelectTrigger className="h-8 w-fit min-w-[140px] rounded-full border-zinc-200 bg-transparent text-xs dark:border-zinc-800">
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

            <Select
              value={selectedAudioOutput}
              onValueChange={setSelectedAudioOutput}
            >
              <SelectTrigger className="h-8 w-fit min-w-[140px] rounded-full border-zinc-200 bg-transparent text-xs dark:border-zinc-800">
                <HugeiconsIcon icon={Speaker01Icon} className="mr-2 size-3" />{" "}
                {/* Speaker icon ideally */}
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

            <Select
              value={selectedVideoInput}
              onValueChange={(val) => {
                setSelectedVideoInput(val);
                setTimeout(() => {
                  void refetchMedia();
                }, 100);
              }}
            >
              <SelectTrigger className="h-8 w-fit min-w-[140px] rounded-full border-zinc-200 bg-transparent text-xs dark:border-zinc-800">
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
          </div>
        </div>

        {/* Right Column: Join Actions */}
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center space-y-8 text-center delay-200 duration-700">
          <div className="space-y-2">
            <h1 className="text-3xl font-normal tracking-tight">
              Ready to join?
            </h1>
            <p className="text-muted-foreground">No one else is here</p>
          </div>

          <div className="flex w-full max-w-xs flex-col gap-3">
            <Button
              size="lg"
              className="h-12 w-full rounded-full text-sm"
              onClick={() => {
                setRoomState("joined");
              }}
            >
              Join now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
