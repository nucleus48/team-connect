import MediaStreams from "@/features/media/components/media-streams";
import MediaProvider from "@/features/media/providers/media-provider";
import TransportProvider from "@/features/media/providers/transport-provider";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return (
    <MediaProvider>
      <TransportProvider routerId={roomId}>
        <MediaStreams />
      </TransportProvider>
    </MediaProvider>
  );
}
