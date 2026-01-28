"use client";

import { useConsumer } from "@/hooks/use-consumer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useLocalMedia } from "@/providers/local-media-provider";
import { useRoom } from "@/providers/room-provider";
import { useMemo } from "react";
import VideoTile, { VideoTileProps } from "./video-tile";

interface TileData extends Pick<
  VideoTileProps,
  | "id"
  | "name"
  | "image"
  | "display"
  | "isLocal"
  | "mediaStream"
  | "audioEnabled"
  | "videoEnabled"
  | "isScreenShare"
> {
  producerIds?: string[];
}

export default function VideoGrid() {
  const { data } = useSession();
  const { userMedia, displayMedia } = useLocalMedia();
  const { peers, producers, isCurrentUserPresenting } = useRoom();

  const tiles = useMemo<TileData[]>(() => {
    const allTiles: TileData[] = [];

    allTiles.push({
      isLocal: true,
      id: "local-cam",
      image: data?.user.image,
      name: data?.user.name ?? "",
      mediaStream: userMedia.mediaStream,
      audioEnabled: userMedia.isAudioEnabled,
      videoEnabled: userMedia.isVideoEnabled,
    });

    if (displayMedia.mediaStream) {
      allTiles.push({
        isLocal: true,
        display: true,
        id: "local-screen",
        videoEnabled: true,
        image: data?.user.image,
        isScreenShare: isCurrentUserPresenting,
        mediaStream: displayMedia.mediaStream,
        name: data?.user.name ? `${data.user.name}'s Screen` : "",
      });
    }

    peers.forEach((peer) => {
      const peerProducers = producers.filter((p) => p.peerId === peer.peerId);
      const cameraProducers = peerProducers.filter((p) => !p.appData.display);

      allTiles.push({
        isLocal: false,
        name: peer.name,
        image: peer.image,
        id: `remote-cam-${peer.peerId}`,
        producerIds: cameraProducers.map((p) => p.producerId),
        audioEnabled: cameraProducers.some(
          (p) => p.kind === "audio" && p.appData.enabled,
        ),
        videoEnabled: cameraProducers.some(
          (p) => p.kind === "video" && p.appData.enabled,
        ),
      });

      const [screenProducer] = peerProducers.filter(
        (p) => p.appData.display && p.kind === "video",
      );

      if (screenProducer) {
        allTiles.push({
          display: true,
          isLocal: false,
          image: peer.image,
          name: `${peer.name}'s Screen`,
          isScreenShare: peer.presenting,
          id: `remote-screen-${peer.peerId}`,
          producerIds: [screenProducer.producerId],
          videoEnabled: screenProducer.appData.enabled,
        });
      }
    });

    return allTiles;
  }, [
    data,
    peers,
    producers,
    userMedia.mediaStream,
    isCurrentUserPresenting,
    userMedia.isAudioEnabled,
    userMedia.isVideoEnabled,
    displayMedia.mediaStream,
  ]);

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
          className="absolute right-4 bottom-4 z-30 h-32 w-max sm:h-40"
        />
      </div>
    );
  }

  if (count === 3 && tileOne && tileTwo && tileThree) {
    return (
      <div className="overflow-y-auto">
        <div className="flex h-full min-h-max flex-wrap content-center items-center gap-2 p-2 sm:gap-4 sm:p-4">
          <TileRenderer
            tile={tileTwo}
            className="h-max min-h-60 min-w-48 flex-1"
          />
          <TileRenderer
            tile={tileThree}
            className="h-max min-h-60 min-w-48 flex-1"
          />
          <TileRenderer
            tile={tileOne}
            className="h-max min-h-60 min-w-48 flex-1"
          />
        </div>
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
    return <RemoteTileWrapper fit={fit} tile={tile} className={className} />;
  }

  return <VideoTile fit={fit} className={className} {...tile} />;
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
  const trackOne = useConsumer(tile.producerIds?.[0] ?? null);
  const trackTwo = useConsumer(tile.producerIds?.[1] ?? null);

  const mediaStream = useMemo(() => {
    const stream = new MediaStream();
    if (trackOne) stream.addTrack(trackOne);
    if (trackTwo) stream.addTrack(trackTwo);
    return stream;
  }, [trackOne, trackTwo]);

  return (
    <VideoTile
      fit={fit}
      className={className}
      mediaStream={mediaStream}
      {...tile}
    />
  );
}
