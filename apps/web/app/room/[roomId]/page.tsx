import MediaStreams from "@/features/media/components/media-streams";
import ShareScreen from "@/features/media/components/share-screen";
import ToggleAudio from "@/features/media/components/toggle-audio";
import ToggleVideo from "@/features/media/components/toggle-video";
import DisplayMediaProvider from "@/features/media/providers/display-media-provider";
import TransportProvider from "@/features/media/providers/transport-provider";
import UserMediaProvider from "@/features/media/providers/user-media-provider";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return (
    <TransportProvider routerId={roomId}>
      <DisplayMediaProvider>
        <UserMediaProvider>
          <main className="flex h-svh flex-col gap-8 p-8">
            <MediaStreams />
            <div className="bg-muted flex w-max self-center rounded-xl">
              <ToggleVideo />
              <ToggleAudio />
              <ShareScreen />
            </div>
          </main>
        </UserMediaProvider>
      </DisplayMediaProvider>
    </TransportProvider>
  );
}
