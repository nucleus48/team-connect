"use client";

import { Button } from "@/components/ui/button";
import { useLocalMedia } from "@/providers/local-media-provider";
import { useRoom } from "@/providers/room-provider";
import {
  Camera01Icon,
  CameraOff01Icon,
  Loading03Icon,
  Mic01Icon,
  MicOff01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTransition } from "react";
import MediaCard from "../media-card";
import {
  CameraSelector,
  MicSelector,
  SpeakerSelector,
} from "./device-settings";

export default function LobbyState() {
  const { userMedia } = useLocalMedia();
  const { peers, joinRoom, isSocketConnected } = useRoom();
  const [isJoiningRoom, startTransition] = useTransition();

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-8 md:p-8">
      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div className="flex w-full flex-col gap-4">
          <div className="relative overflow-hidden rounded-xl bg-zinc-900 shadow-2xl ring-1 ring-white/10">
            <MediaCard
              muted
              mediaStream={userMedia.mediaStream}
              className={`h-max min-h-[315px] w-full scale-x-[-1] transform object-cover transition-opacity duration-300 ${userMedia.isVideoEnabled ? "opacity-100" : "opacity-0"}`}
            />

            {!userMedia.isVideoEnabled && (
              <div className="text-muted-foreground absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="rounded-full bg-zinc-800 p-4">
                  <HugeiconsIcon icon={CameraOff01Icon} className="size-8" />
                </div>
                <p className="text-sm font-medium">Camera is off</p>
              </div>
            )}

            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              <Button
                variant={
                  !userMedia.isAudioEnabled ? "destructive" : "secondary"
                }
                size="icon"
                className="size-12 rounded-full shadow-lg"
                onClick={() => void userMedia.toggleAudioEnabled()}
              >
                <HugeiconsIcon
                  icon={!userMedia.isAudioEnabled ? MicOff01Icon : Mic01Icon}
                  className="size-5"
                />
              </Button>
              <Button
                variant={
                  !userMedia.isVideoEnabled ? "destructive" : "secondary"
                }
                size="icon"
                className="size-12 rounded-full shadow-lg"
                onClick={() => void userMedia.toggleVideoEnabled()}
              >
                <HugeiconsIcon
                  icon={
                    !userMedia.isVideoEnabled ? CameraOff01Icon : Camera01Icon
                  }
                  className="size-5"
                />
              </Button>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-xl flex-wrap justify-center gap-2">
            <MicSelector className="h-8 w-fit min-w-[140px] rounded-full border-zinc-200 bg-transparent text-xs dark:border-zinc-800" />
            <SpeakerSelector className="h-8 w-fit min-w-[140px] rounded-full border-zinc-200 bg-transparent text-xs dark:border-zinc-800" />
            <CameraSelector className="h-8 w-fit min-w-[140px] rounded-full border-zinc-200 bg-transparent text-xs dark:border-zinc-800" />
          </div>
        </div>

        {/* Right Column: Join Actions */}
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center space-y-8 text-center delay-200 duration-700">
          <div className="space-y-2">
            <h1 className="text-3xl font-normal tracking-tight">
              Ready to join?
            </h1>
            <p className="text-muted-foreground">
              {peers.length
                ? `${peers.length.toString()} peer${peers.length === 1 ? "" : "s"} active`
                : "No one else is here"}
            </p>
          </div>

          <div className="flex w-full max-w-xs flex-col gap-3">
            <Button
              size="lg"
              disabled={!isSocketConnected}
              className="h-12 w-full rounded-full text-sm"
              onClick={() => {
                startTransition(joinRoom);
              }}
            >
              {isJoiningRoom && (
                <HugeiconsIcon
                  strokeWidth={2}
                  className="h-5 w-5 animate-spin"
                  icon={Loading03Icon}
                />
              )}
              Join now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
