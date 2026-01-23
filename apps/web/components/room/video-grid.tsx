"use client";

import { useConsumeMedia } from "@/hooks/use-consume-media";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useLocalMedia } from "@/providers/local-media-provider";
import { useRoom } from "@/providers/room-provider";
import { useMemo } from "react";
import VideoTile from "./video-tile";

interface TileData {
  id: string;
  name: string;
  isLocal: boolean;
  isScreenShare: boolean;
  mediaStream?: MediaStream | null;
  producerIds?: string[];
}

export default function VideoGrid() {
  const { peers, producers } = useRoom();
  const { userMedia, displayMedia } = useLocalMedia();

  const tiles = useMemo<TileData[]>(() => {
    const allTiles: TileData[] = [];

    allTiles.push({
      id: "local-cam",
      name: "You",
      isLocal: true,
      isScreenShare: false,
      mediaStream: userMedia.mediaStream,
    });

    if (displayMedia.mediaStream) {
      allTiles.push({
        id: "local-screen",
        name: "Your Screen",
        isLocal: true,
        isScreenShare: true,
        mediaStream: displayMedia.mediaStream,
      });
    }

    peers.forEach((peer) => {
      const peerProducers = producers.filter((p) => p.peerId === peer.peerId);
      const cameraProducers = peerProducers.filter((p) => !p.appData.display);

      allTiles.push({
        id: `remote-cam-${peer.peerId}`,
        name: "Peer",
        isLocal: false,
        isScreenShare: false,
        producerIds: cameraProducers.map((p) => p.producerId),
      });

      const [screenProducer] = peerProducers.filter(
        (p) => p.appData.display && p.kind === "video",
      );

      if (screenProducer) {
        allTiles.push({
          id: `remote-screen-${peer.peerId}`,
          name: "Peer's Screen",
          isLocal: false,
          isScreenShare: peer.presenting,
          producerIds: [screenProducer.producerId],
        });
      }
    });

    return allTiles;
  }, [peers, producers, userMedia.mediaStream, displayMedia.mediaStream]);

  const presentationTile = tiles.findLast((t) => t.isScreenShare);

  if (presentationTile) {
    return (
      <PresentationLayout
        mainTile={presentationTile}
        sidebarTiles={tiles.filter((t) => t.id !== presentationTile.id)}
      />
    );
  }

  return <StandardGridLayout tiles={tiles} />;
}

function StandardGridLayout({ tiles }: { tiles: TileData[] }) {
  const isMobile = useIsMobile();

  const count = tiles.length;
  const [tileOne, tileTwo, tileThree] = tiles;

  if (count === 1 && tileOne) {
    return (
      <div className="overflow-hidden sm:p-4">
        <TileRenderer
          tile={tileOne}
          className={cn(isMobile && "rounded-none border-0")}
          fit={isMobile ? "cover" : "contain"}
        />
      </div>
    );
  }

  if (count === 2 && tileOne && tileTwo) {
    return (
      <div className="overflow-hidden sm:p-4">
        <TileRenderer
          tile={tileTwo}
          className={cn(isMobile && "rounded-none border-0")}
          fit={isMobile ? "cover" : "contain"}
        />
        <TileRenderer
          tile={tileOne}
          className="absolute right-4 bottom-4 h-32 w-max sm:h-40"
        />
      </div>
    );
  }

  if (count === 3 && tileOne && tileTwo && tileThree) {
    return (
      <div className="flex flex-wrap content-center items-center justify-center gap-2 overflow-hidden p-2 sm:gap-4 sm:p-4">
        <TileRenderer tile={tileOne} className="col-span-2 h-[45%] w-max" />
        <TileRenderer tile={tileTwo} className="h-[25%] w-max sm:h-[45%]" />
        <TileRenderer tile={tileThree} className="h-[25%] w-max sm:h-[45%]" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid auto-rows-[minmax(40%,1fr)] grid-cols-2 gap-2 overflow-y-auto p-2 sm:gap-4 sm:p-4",
        tiles.length > 4 && "lg:grid-cols-3",
        tiles.length > 6 && "xl:grid-cols-4",
      )}
    >
      {tiles.map((tile) => (
        <TileRenderer key={tile.id} tile={tile} />
      ))}
    </div>
  );
}

function PresentationLayout({
  mainTile,
  sidebarTiles,
}: {
  mainTile: TileData;
  sidebarTiles: TileData[];
}) {
  return (
    <div className="flex flex-col gap-2 overflow-hidden p-2 sm:gap-4 sm:p-4 lg:flex-row">
      <div className="grid grow rounded-xl bg-zinc-900 shadow-2xl ring-2 ring-blue-500/20">
        <TileRenderer tile={mainTile} className="border-none" fit="contain" />
      </div>

      <div className="flex h-32 w-full gap-2 overflow-x-auto sm:gap-4 lg:h-full lg:w-80 lg:flex-col lg:overflow-x-hidden">
        {sidebarTiles.map((tile) => (
          <TileRenderer
            tile={tile}
            key={tile.id}
            className="h-full min-h-32 w-auto min-w-48 lg:h-auto lg:w-full"
          />
        ))}
      </div>
    </div>
  );
}

function TileRenderer({
  tile,
  className,
  fit,
}: {
  tile: TileData;
  className?: string;
  fit?: "cover" | "contain";
}) {
  if (!tile.isLocal && tile.producerIds) {
    return <RemoteTileWrapper tile={tile} className={className} fit={fit} />;
  }

  return (
    <VideoTile
      id={tile.id}
      name={tile.name}
      isLocal={tile.isLocal}
      isScreenShare={tile.isScreenShare}
      mediaStream={tile.mediaStream ?? null}
      className={className}
      fit={fit}
    />
  );
}

function RemoteTileWrapper({
  tile,
  className,
  fit,
}: {
  tile: TileData;
  className?: string;
  fit?: "cover" | "contain";
}) {
  const mediaStream = useConsumeMedia(tile.producerIds ?? []);

  return (
    <VideoTile
      id={tile.id}
      name={tile.name}
      isLocal={tile.isLocal}
      isScreenShare={tile.isScreenShare}
      mediaStream={mediaStream}
      className={className}
      fit={fit}
    />
  );
}
