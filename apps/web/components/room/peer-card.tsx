"use client";

import MediaCard from "@/components/media-card";
import { useConsumeMedia } from "@/hooks/use-consume-media";
import { Peer, useRoom } from "@/providers/room-provider";

export function PeerCard({ peer }: { peer: Peer }) {
  const { producers } = useRoom();

  const streams = Object.entries(
    producers
      .filter(
        (p) =>
          p.peerId === peer.peerId && (!peer.presenting || !p.appData.display),
      )
      .reduce<Record<string, string[]>>((acc, p) => {
        const stream = acc[p.streamId] ?? [];
        stream.push(p.producerId);
        acc[p.streamId] = stream;
        return acc;
      }, {}),
  );

  if (streams.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-white/10 bg-zinc-900 shadow-2xl">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 animate-pulse rounded-full bg-zinc-800" />
          <p className="text-muted-foreground text-sm">Waiting for video...</p>
        </div>
      </div>
    );
  }

  return streams.map(([streamId, stream]) => (
    <ConsumeStream key={streamId} producers={stream} />
  ));
}

function ConsumeStream({ producers }: { producers: string[] }) {
  const mediaStream = useConsumeMedia(producers);

  return (
    <MediaCard
      className="h-full w-full object-cover"
      mediaStream={mediaStream}
      // name={...} // We might want to pass a name prop to MediaCard if it supports it
    />
  );
}
