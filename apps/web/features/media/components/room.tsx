"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronUpIcon } from "lucide-react";
import { useState } from "react";
import TransportProvider from "../providers/transport-provider";
import JoinRoom from "./join-room";
import MediaStreams from "./media-streams";
import EndCall from "./ui/end-call";
import ScreenShare from "./ui/screen-share";
import SelectAudioDevice from "./ui/select-audio-device";
import SelectVideoDevice from "./ui/select-video-device";
import ToggleAudio from "./ui/toggle-audio";
import ToggleVideo from "./ui/toggle-video";
import DisplayMediaProvider from "../providers/display-media-provider";

export default function Room() {
  const [joined, setJoined] = useState(false);

  if (!joined) {
    return <JoinRoom setJoined={setJoined} />;
  }

  return (
    <TransportProvider>
      <DisplayMediaProvider>
        <div className="relative flex h-full flex-col overflow-hidden">
          <MediaStreams />
          <div className="bg-card absolute inset-x-0 bottom-2 mx-auto flex w-max items-center justify-center gap-4 rounded-full border-2 p-2 sm:static sm:mx-0 sm:w-full sm:rounded-none sm:border-0 sm:border-t-2">
            <div className="flex items-center rounded-full border">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant={"ghost"}
                    className="hidden sm:flex"
                  >
                    <ChevronUpIcon className="text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-max rounded-full p-1">
                  <SelectAudioDevice className="w-80 rounded-full" />
                </PopoverContent>
              </Popover>
              <ToggleAudio />
            </div>

            <div className="flex items-center rounded-full border">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant={"ghost"}
                    className="hidden sm:flex"
                  >
                    <ChevronUpIcon className="text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-max rounded-full p-1">
                  <SelectVideoDevice className="w-80 rounded-full" />
                </PopoverContent>
              </Popover>
              <ToggleVideo />
            </div>

            <ScreenShare />
            <EndCall setJoined={setJoined} />
          </div>
        </div>
      </DisplayMediaProvider>
    </TransportProvider>
  );
}
