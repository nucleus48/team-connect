import Room from "@/features/media/components/room";
import DisplayMediaProvider from "@/features/media/providers/display-media-provider";
import SocketProvider from "@/features/media/providers/socket-provider";
import UserMediaProvider from "@/features/media/providers/user-media-provider";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return (
    // <TransportProvider routerId={roomId}>
    //   <DisplayMediaProvider>
    //     <UserMediaProvider>
    //       <main className="flex h-svh flex-col gap-8 p-8">
    //         <MediaStreams />
    //         <div className="bg-muted flex w-max self-center rounded-xl">
    //           <ToggleVideo />
    //           <ToggleAudio />
    //           <ShareScreen />
    //         </div>
    //       </main>
    //     </UserMediaProvider>
    //   </DisplayMediaProvider>
    // </TransportProvider>
    <SocketProvider roomId={roomId}>
      <UserMediaProvider>
        <DisplayMediaProvider>
          <Room />
        </DisplayMediaProvider>
      </UserMediaProvider>
    </SocketProvider>
  );
}
