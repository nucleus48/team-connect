"use client";

import MainHeader from "@/components/main-header";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/use-permission";
import { Loader2Icon } from "lucide-react";
import { useCallback, useTransition } from "react";
import { useSocket } from "../providers/socket-provider";
import { useUserMedia } from "../providers/user-media-provider";
import SelectAudioDevice from "./ui/select-audio-device";
import SelectVideoDevice from "./ui/select-video-device";
import ToggleAudio from "./ui/toggle-audio";
import ToggleVideo from "./ui/toggle-video";
import Video from "./video";

export type JoinRoomProps = {
  setJoined: (joined: boolean) => void;
};

export default function JoinRoom({ setJoined }: JoinRoomProps) {
  const [isLoading, startTransition] = useTransition();
  const microphonePermission = usePermission("microphone");
  const cameraPermission = usePermission("camera");
  const socket = useSocket();
  const {
    audioTrack,
    videoTrack,
    isVideoEnabled,
    isAudioEnabled,
    enableAudioPermission,
    enableVideoPermission,
  } = useUserMedia();

  const handleJoinRoom = useCallback(async () => {
    const joined: boolean = await socket.request("joinRoom");
    setJoined(joined);
  }, [socket, setJoined]);

  return (
    <>
      <MainHeader />
      <div className="flex h-full flex-col items-center justify-center gap-8 p-4">
        <div className="relative w-full max-w-[800px]">
          <Video
            flip
            muted
            audioTrack={audioTrack}
            videoTrack={videoTrack}
            audioEnabled={isAudioEnabled}
            containerClassName="size-full object-cover aspect-video border-2"
          />

          {!isVideoEnabled &&
            cameraPermission === "granted" &&
            microphonePermission === "granted" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-lg text-white">Camera is off</p>
              </div>
            )}

          {(cameraPermission === "prompt" ||
            microphonePermission === "prompt") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-8">
              <p className="text-center text-lg text-balance text-white">
                Do you want others to {cameraPermission !== "granted" && "see"}
                {cameraPermission !== "granted" &&
                  microphonePermission !== "granted" &&
                  " and "}
                {microphonePermission !== "granted" && "hear"} you?
              </p>

              <div className="flex gap-4">
                {microphonePermission !== "granted" && (
                  <Button variant={"secondary"} onClick={enableAudioPermission}>
                    Enable audio
                  </Button>
                )}

                {cameraPermission !== "granted" && (
                  <Button variant={"secondary"} onClick={enableVideoPermission}>
                    Enable video
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex gap-2">
            <ToggleAudio className="size-9 [&_svg:not([class*='size-'])]:size-5" />
            <SelectAudioDevice className="w-56 rounded-full" />
          </div>
          <div className="flex gap-2">
            <ToggleVideo className="size-9 [&_svg:not([class*='size-'])]:size-5" />
            <SelectVideoDevice className="w-56 rounded-full" />
          </div>
        </div>

        <Button
          size="lg"
          disabled={isLoading}
          className="rounded-full"
          onClick={() => startTransition(handleJoinRoom)}
        >
          {isLoading && <Loader2Icon className="animate-spin" />}
          <span>Join room</span>
        </Button>
      </div>
    </>
  );
}
