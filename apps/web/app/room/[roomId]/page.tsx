import LocalMediaProvider from "./components/local-media-provider";
import Room from "./components/room";
import RoomProvider from "./components/room-provider";

export default async function RoomPage({
  params,
}: PageProps<"/room/[roomId]">) {
  const { roomId } = await params;

  return (
    <LocalMediaProvider>
      <RoomProvider roomId={roomId}>
        <Room />
      </RoomProvider>
    </LocalMediaProvider>
  );
}
