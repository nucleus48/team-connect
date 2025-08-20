import Room from "@/features/media/components/room";
import SocketProvider from "@/features/media/providers/socket-provider";
import UserMediaProvider from "@/features/media/providers/user-media-provider";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return (
    <SocketProvider roomId={roomId}>
      <UserMediaProvider>
        <Room />
      </UserMediaProvider>
    </SocketProvider>
  );
}
