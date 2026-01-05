import LocalMediaProvider from "@/providers/local-media-provider";
import { Room } from "@/providers/room-provider";

export default async function RoomPage({
  params,
}: PageProps<"/room/[roomId]">) {
  const { roomId } = await params;

  return (
    <LocalMediaProvider>
      <Room roomId={roomId} />
    </LocalMediaProvider>
  );
}
